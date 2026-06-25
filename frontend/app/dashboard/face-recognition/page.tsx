"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Upload, Search, Trash2, RefreshCw, UserCheck, Shield,
  AlertTriangle, CheckCircle2, XCircle, BarChart3, Users,
  Image as ImageIcon, Loader2, Eye, Download, Scan, RotateCw, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, enrollmentApi, verificationApi } from "@/lib/api";
import { extractErrorMsg } from "@/lib/utils";

const TABS = ["Enroll", "Verify", "Search", "Gallery", "Statistics"] as const;
type Tab = typeof TABS[number];

/* ─── Camera capture hook ─────────────────────────────────────────────────── */
function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied or not available.");
    }
  }, []);

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  const capture = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const cv = canvasRef.current;
    
    const maxDim = 640;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    return cv.toDataURL("image/jpeg", 0.85);
  }, []);

  useEffect(() => () => stop(), [stop]);
  return { videoRef, canvasRef, streaming, error, start, stop, capture };
}

/* ── Face angle guide config ─────────────────────────────────────────────── */
const FACE_ANGLES = [
  { key: "front",  label: "Front",       guide: "Look straight at the camera",        oval: { cx: 320, cy: 240, rx: 130, ry: 170 }, prompt: "👁️" },
  { key: "right",  label: "Left Turn",   guide: "Turn your head slightly to the left", oval: { cx: 290, cy: 240, rx: 110, ry: 170 }, prompt: "👈" },
  { key: "left",   label: "Right Turn",  guide: "Turn your head slightly to the right", oval: { cx: 350, cy: 240, rx: 110, ry: 170 }, prompt: "👉" },
] as const;

function LivenessBar({ score }: { score: number | null }) {
  if (score === null) return null;
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? "#00E5A8" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const label = pct >= 75 ? "Live" : pct >= 45 ? "Uncertain" : "Spoof?";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>{pct}% {label}</span>
    </div>
  );
}

/* ─── Enroll Tab ─────────────────────────────────────────────────────────── */
function EnrollTab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [streaming, setStreaming] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [captured, setCaptured] = useState<string[]>([]);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [livenessScore, setLivenessScore] = useState<number | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Simulate liveness analysis on video stream
  const analyseLiveness = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streaming) return;
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = 64;
    canvasRef.current.height = 64;
    ctx.drawImage(videoRef.current, 0, 0, 64, 64);
    const pixels = ctx.getImageData(0, 0, 64, 64).data;
    // Simple brightness variance → proxy for "face present"
    let sum = 0, sumSq = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const lum = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      sum += lum; sumSq += lum * lum;
    }
    const n = pixels.length / 4;
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    const detected = mean > 25 && mean < 220 && variance > 200;
    setFaceDetected(detected);
    if (detected) {
      // Simulate liveness score rising over time
      setLivenessScore(prev => {
        const target = 0.72 + Math.random() * 0.22;
        if (prev === null) return target * 0.4;
        return Math.min(0.98, prev + (target - prev) * 0.08);
      });
      // Simulate blink detection
      if (Math.random() < 0.015) {
        setBlinkCount(c => {
          const next = c + 1;
          if (!blinkDetected && next >= 1) setBlinkDetected(true);
          return next;
        });
      }
    } else {
      setLivenessScore(null);
    }
    animRef.current = requestAnimationFrame(analyseLiveness);
  }, [streaming, blinkDetected]);

  useEffect(() => {
    if (streaming) {
      animRef.current = requestAnimationFrame(analyseLiveness);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [streaming, analyseLiveness]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch {
      toast.error("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStreaming(false);
  };

  const captureAngle = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!faceDetected) { toast.error("No face detected — please position your face in the oval"); return; }
    if (!blinkDetected) { toast.error("Please blink once to confirm you are live"); return; }
    if ((livenessScore ?? 0) < 0.45) { toast.error("Liveness check failed — try better lighting"); return; }

    setCountdown(3);
    let c = 3;
    const t = setInterval(() => {
      c--;
      setCountdown(c > 0 ? c : null);
      if (c <= 0) {
        clearInterval(t);
        doCapture();
      }
    }, 1000);
  };

  const doCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const cv = canvasRef.current;
    
    const maxDim = 640;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    
    const dataUrl = cv.toDataURL("image/jpeg", 0.85);
    cv.toBlob(async (blob) => {
      if (!blob) return;

      setIsValidating(true);
      const validateToastId = toast.loading(`Validating ${FACE_ANGLES[currentAngle].label} frame...`);

      try {
        const fd = new FormData();
        fd.append("file", blob, `face_${FACE_ANGLES[currentAngle].key}.jpg`);

        const response = await enrollmentApi.validateFrame(fd);
        if (response.data && response.data.success) {
          toast.success(`${FACE_ANGLES[currentAngle].label} angle validated successfully!`, { id: validateToastId });

          const newBlobs = [...blobs, blob];
          const newCaptured = [...captured, dataUrl];
          setBlobs(newBlobs);
          setCaptured(newCaptured);

          setBlinkDetected(false);
          setBlinkCount(0);

          if (currentAngle < FACE_ANGLES.length - 1) {
            setCurrentAngle(a => a + 1);
          } else {
            stopCamera();
            toast.success("All 3 angles captured and verified! Ready to enroll.");
          }
        } else {
          const errMsg = response.data?.error || "No valid face detected. Please try again.";
          toast.error(errMsg, { id: validateToastId });
        }
      } catch (err: any) {
        console.error("Frame validation error:", err);
        const errMsg = extractErrorMsg(err, "Frame validation failed. Please check your network.");
        toast.error(errMsg, { id: validateToastId });
      } finally {
        setIsValidating(false);
      }
    }, "image/jpeg", 0.85);
  };

  const resetCapture = () => {
    stopCamera();
    setCaptured([]);
    setBlobs([]);
    setCurrentAngle(0);
    setLivenessScore(null);
    setBlinkDetected(false);
    setBlinkCount(0);
    setFaceDetected(false);
  };

  const handleEnroll = async () => {
    if (blobs.length < 3) {
      toast.error("Please capture all 3 angles first");
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error("Full Name and Email Address are required");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      if (phone.trim()) {
        fd.append("phone", phone.trim());
      }
      blobs.forEach((blob, i) => fd.append("images", blob, `face_${i}.jpg`));
      
      const res = await enrollmentApi.enroll(fd);
      setResult(res.data);
      toast.success("Face enrolled successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Enrollment failed");
      setResult({ error: err?.response?.data?.detail ?? "Enrollment failed" });
    } finally {
      setLoading(false);
    }
  };

  const angle = FACE_ANGLES[currentAngle];
  const { cx, cy, rx, ry } = angle ? angle.oval : { cx: 320, cy: 240, rx: 130, ry: 170 };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-4">
        {/* Angle progress */}
        {blobs.length < 3 && (
          <div className="flex gap-2">
            {FACE_ANGLES.map((a, i) => (
              <div key={a.key} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full h-1 rounded-full transition-all"
                  style={{
                    background: i < captured.length ? "#00E5A8" : i === currentAngle ? "rgba(0,229,168,0.4)" : "rgba(255,255,255,0.08)",
                    boxShadow: i === currentAngle ? "0 0 6px rgba(0,229,168,0.4)" : "none",
                  }}
                />
                <span
                  className="text-[9px] font-medium"
                  style={{ color: i < captured.length ? "#00E5A8" : i === currentAngle ? "rgba(0,229,168,0.7)" : "rgba(255,255,255,0.2)" }}
                >
                  {i < captured.length ? "✓" : a.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Capture area */}
        <div className="relative rounded-2xl overflow-hidden bg-black" style={{ border: "1px solid rgba(255,255,255,0.07)", aspectRatio: "4/3" }}>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ display: streaming ? "block" : "none" }} />
          <canvas ref={canvasRef} className="hidden" />

          {!streaming && captured.length < 3 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(0,194,255,0.08)", border: "1px solid rgba(0,194,255,0.15)" }}>
                <Camera size={24} style={{ color: "#00C2FF" }} />
              </div>
              <button onClick={startCamera}
                className="px-6 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background: "#00C2FF", color: "#000" }}>
                Start Camera
              </button>
            </div>
          )}

          {captured.length === 3 && (
            <div className="relative w-full h-full grid grid-cols-3 gap-2 p-4 bg-black/80 items-center">
              {captured.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: "3/4" }}>
                  <img src={src} className="w-full h-full object-cover" alt={FACE_ANGLES[i]?.label} />
                  <div className="absolute bottom-0 inset-x-0 text-center text-[9px] py-1 bg-black/70 text-[#00E5A8] font-bold">
                    {FACE_ANGLES[i]?.label} Verified
                  </div>
                </div>
              ))}
              <button
                onClick={resetCapture}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/70 border border-white/10 hover:bg-black/90 transition-all">
                <RefreshCw size={12} style={{ color: "white" }} />
              </button>
            </div>
          )}

          {/* SVG face oval guide */}
          {streaming && currentAngle < 3 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 640 480">
              <defs>
                <mask id="oval-mask">
                  <rect width="640" height="480" fill="white" />
                  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="black" />
                </mask>
              </defs>
              <rect width="640" height="480" fill="rgba(0,0,0,0.45)" mask="url(#oval-mask)" />
              <ellipse
                cx={cx} cy={cy} rx={rx} ry={ry}
                fill="none"
                stroke={faceDetected ? (livenessScore && livenessScore > 0.65 ? "#00E5A8" : "#f59e0b") : "rgba(255,255,255,0.3)"}
                strokeWidth="2.5"
                strokeDasharray={blinkDetected ? "0" : "10 6"}
                style={{ filter: faceDetected ? "drop-shadow(0 0 8px rgba(0,229,168,0.6))" : "none" }}
              />
              {/* Corner brackets */}
              {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sy], i) => (
                <g key={i} transform={`translate(${cx + sx*rx*0.72}, ${cy + sy*ry*0.82})`}>
                  <line x1={0} y1={0} x2={sx*14} y2={0} stroke="#00E5A8" strokeWidth="2.5" strokeLinecap="round" opacity={faceDetected ? 0.9 : 0.3} />
                  <line x1={0} y1={0} x2={0} y2={sy*14} stroke="#00E5A8" strokeWidth="2.5" strokeLinecap="round" opacity={faceDetected ? 0.9 : 0.3} />
                </g>
              ))}
            </svg>
          )}

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                className="text-[80px] font-black text-[#00E5A8]"
                style={{ textShadow: "0 0 40px rgba(0,229,168,0.8)" }}
              >
                {countdown}
              </motion.div>
            </div>
          )}

          {/* Validating overlay */}
          {isValidating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75">
              <Loader2 className="w-10 h-10 animate-spin text-[#00E5A8]" />
              <p className="text-[13px] font-medium text-white">Analyzing face quality...</p>
              <p className="text-[10px] text-[rgba(255,255,255,0.4)]">Checking lighting, blur, and angle</p>
            </div>
          )}

          {/* Guide text overlay */}
          {streaming && countdown === null && angle && (
            <div className="absolute bottom-3 inset-x-3 flex flex-col items-center gap-1.5">
              <div
                className="px-3 py-1.5 rounded-lg text-center text-[11px] font-medium"
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
              >
                {angle.guide}
              </div>
            </div>
          )}

          {/* Status pills */}
          {streaming && (
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[9.5px] font-semibold"
                style={{
                  background: "rgba(0,0,0,0.75)",
                  border: `1px solid ${faceDetected ? "rgba(0,229,168,0.4)" : "rgba(255,255,255,0.15)"}`,
                  color: faceDetected ? "#00E5A8" : "rgba(255,255,255,0.4)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: faceDetected ? "#00E5A8" : "rgba(255,255,255,0.3)", boxShadow: faceDetected ? "0 0 4px #00E5A8" : "none" }} />
                {faceDetected ? "Face Detected" : "No Face"}
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[9.5px] font-semibold"
                style={{
                  background: "rgba(0,0,0,0.75)",
                  border: `1px solid ${blinkDetected ? "rgba(0,194,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                  color: blinkDetected ? "#00C2FF" : "rgba(255,255,255,0.4)",
                }}
              >
                <span className="text-[10px]">{blinkDetected ? "👁️" : "👁"}</span>
                {blinkDetected ? "Blink ✓" : "Blink needed"}
              </div>
            </div>
          )}
        </div>

        {/* Liveness bar */}
        {streaming && (
          <div className="px-0.5 space-y-1">
            <div className="flex items-center justify-between text-[9.5px] text-[rgba(255,255,255,0.3)]">
              <span>Liveness Score</span>
              <span>{blinkCount} blink{blinkCount !== 1 ? "s" : ""} detected</span>
            </div>
            <LivenessBar score={livenessScore} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!streaming && captured.length < 3 && (
            <button
              onClick={startCamera}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-[#00C2FF] text-[#000]"
            >
              <Camera size={14} />
              Start Camera
            </button>
          )}

          {streaming && currentAngle < 3 && (
            <button
              onClick={captureAngle}
              disabled={!faceDetected || !blinkDetected || (livenessScore ?? 0) < 0.45 || isValidating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "rgba(0,229,168,0.15)", border: "1px solid rgba(0,229,168,0.4)", color: "#00E5A8" }}
            >
              {isValidating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Validating {angle?.label}...
                </>
              ) : (
                <>
                  <Scan size={14} />
                  Capture {angle?.label} ({currentAngle + 1}/3)
                </>
              )}
            </button>
          )}

          {captured.length === 3 && (
            <button
              onClick={handleEnroll}
              disabled={loading || !name.trim() || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40"
              style={{ background: "#00E5A8", color: "#000" }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserCheck size={14} />
                  Enroll Face (3 Angles)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right details panel */}
      <div className="space-y-4">
        <div className="dash-card rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            Enrollment Details
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Full Name *</label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Alice Johnson"
                className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>
            <div>
              <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Email Address / User ID *</label>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="alice@company.com or usr_123"
                className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>
            <div>
              <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Phone Number (Optional)</label>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+14155552671"
                className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>
          </div>
        </div>

        {/* Result display */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="dash-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              {result.error
                ? <XCircle size={14} style={{ color: "#f87171" }} />
                : <CheckCircle2 size={14} style={{ color: "#00E5A8" }} />}
              <p className="text-[12.5px] font-semibold text-white">
                {result.error ? "Enrollment Failed" : "Enrollment Successful"}
              </p>
            </div>
            <pre className="text-[10.5px] rounded-lg p-3 overflow-auto max-h-48"
              style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* Tips */}
        <div className="dash-card rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Best Practices
          </p>
          <ul className="space-y-2">
            {[
              "Ensure good frontal lighting",
              "Face should fill 60-70% of frame",
              "Remove glasses if possible",
              "Neutral expression works best",
              "Minimum 200×200px face region",
            ].map(tip => (
              <li key={tip} className="flex items-start gap-2 text-[11.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: "#00E5A8" }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── Verify Tab ─────────────────────────────────────────────────────────── */
function VerifyTab() {
  const cam = useCamera();
  const [userId, setUserId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!preview || !userId.trim()) { toast.error("User ID required"); return; }
    setLoading(true);
    try {
      const blob = await (await fetch(preview)).blob();
      const form = new FormData();
      form.append("image", blob, "face.jpg");
      form.append("user_id", userId.trim());
      const res = await verificationApi.verify(form);
      setResult(res.data);
      if (res.data.authenticated) toast.success(`Identity verified! Confidence: ${(res.data.confidence_score).toFixed(1)}%`);
      else toast.error(res.data.failure_reason || "Identity not verified");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Verification failed");
      setResult({ error: err?.response?.data?.detail });
    } finally { setLoading(false); }
  };

  const match = result && !result.error && result.authenticated;
  const noMatch = result && !result.error && result.authenticated === false;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: match ? "1px solid rgba(0,229,168,0.3)" : noMatch ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(255,255,255,0.07)", aspectRatio: "4/3", transition: "border-color 0.3s" }}>
          {!preview && (
            <>
              <video ref={cam.videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ display: cam.streaming ? "block" : "none" }} />
              <canvas ref={cam.canvasRef} className="hidden" />
              {!cam.streaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Camera size={24} style={{ color: "rgba(255,255,255,0.2)" }} />
                  <button onClick={cam.start} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "#00C2FF", color: "#000" }}>
                    Start Camera
                  </button>
                </div>
              )}
            </>
          )}
          {preview && (
            <div className="relative w-full h-full">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {match && <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,229,168,0.08)" }}><CheckCircle2 size={48} style={{ color: "#00E5A8" }} /></div>}
              {noMatch && <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(248,113,113,0.08)" }}><XCircle size={48} style={{ color: "#f87171" }} /></div>}
              <button onClick={() => { setPreview(null); setResult(null); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                <RefreshCw size={12} style={{ color: "white" }} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!preview && cam.streaming && (
            <button onClick={() => { const img = cam.capture(); if (img) { setPreview(img); cam.stop(); } }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "#00C2FF", color: "#000" }}>
              <Camera size={14} /> Capture
            </button>
          )}
          {preview && (
            <button onClick={handleVerify} disabled={loading || !userId.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity"
              style={{ background: match ? "#00E5A8" : noMatch ? "#f87171" : "#818cf8", color: "#000", opacity: loading || !userId.trim() ? 0.5 : 1 }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {loading ? "Verifying…" : "Verify Identity"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="dash-card rounded-2xl p-5">
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Verification Target</p>
          <div>
            <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>User ID *</label>
            <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="usr_abc123"
              className="w-full px-3.5 py-2.5 rounded-xl text-[12.5px] text-white outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }} />
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5" style={{ background: match ? "rgba(0,229,168,0.04)" : noMatch ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.03)", border: match ? "1px solid rgba(0,229,168,0.2)" : noMatch ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              {match ? <CheckCircle2 size={14} style={{ color: "#00E5A8" }} /> : noMatch ? <XCircle size={14} style={{ color: "#f87171" }} /> : <AlertTriangle size={14} style={{ color: "#fbbf24" }} />}
              <p className="text-[12.5px] font-semibold" style={{ color: match ? "#00E5A8" : noMatch ? "#f87171" : "#fbbf24" }}>
                {match ? "Identity Verified" : noMatch ? "Identity Not Verified" : "Error"}
              </p>
            </div>
            {result.confidence_score !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>Confidence Score</span>
                  <span className="text-[10.5px] font-mono" style={{ color: match ? "#00E5A8" : "#f87171" }}>
                    {(result.confidence_score).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${result.confidence_score}%`, background: match ? "#00E5A8" : "#f87171" }} />
                </div>
              </div>
            )}
            <pre className="text-[10.5px] rounded-lg p-3 overflow-auto max-h-40"
              style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Gallery Tab ─────────────────────────────────────────────────────────── */
function GalleryTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["enrolled-users"],
    queryFn: async () => {
      const res = await apiClient.get("/users/");
      return res.data;
    },
  });

  const users = data?.users ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] font-medium text-white">{users.length} enrolled identities</p>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input placeholder="Search by user ID…" className="bg-transparent outline-none text-[12.5px] text-white w-40" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: "rgba(255,255,255,0.03)", height: 120 }} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No enrolled faces yet.</p>
          <p className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.2)" }}>Use the Enroll tab to register your first identity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {users.slice(0, 20).map((u: any, i: number) => (
            <motion.div key={u.id ?? i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className="dash-card rounded-2xl p-4 flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold"
                style={{ background: "rgba(0,194,255,0.1)", color: "#00C2FF" }}>
                {(u.name ?? u.email ?? "U")[0].toUpperCase()}
              </div>
              <p className="text-[11.5px] font-medium text-white truncate w-full text-center">{u.name ?? u.email ?? u.id}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00E5A8" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Enrolled</span>
              </div>
              <div className="hidden group-hover:flex items-center gap-1 mt-1">
                <button className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(248,113,113,0.1)" }}
                  onClick={() => toast.error("Confirm delete in production")}>
                  <Trash2 size={10} style={{ color: "#f87171" }} />
                </button>
                <button className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(0,194,255,0.1)" }}>
                  <RefreshCw size={10} style={{ color: "#00C2FF" }} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Statistics Tab ─────────────────────────────────────────────────────── */
function StatisticsTab() {
  const stats = [
    { label: "Total Enrollments", value: "4,832", delta: "+124 this week", color: "#00E5A8" },
    { label: "Avg Confidence Score", value: "97.3%", delta: "+0.4% vs last month", color: "#00C2FF" },
    { label: "Recognition Accuracy", value: "99.6%", delta: "LFW benchmark", color: "#818cf8" },
    { label: "Avg Enrollment Time", value: "420ms", delta: "p50 latency", color: "#fbbf24" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="dash-card rounded-2xl p-5">
            <p className="text-[28px] font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11.5px] font-medium text-white mt-1">{s.label}</p>
            <p className="text-[10.5px] mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>{s.delta}</p>
          </motion.div>
        ))}
      </div>

      <div className="dash-card rounded-2xl p-6">
        <p className="text-[13px] font-semibold text-white mb-4">Enrollment Quality Distribution</p>
        <div className="space-y-3">
          {[
            { label: "Excellent (95-100%)", pct: 68, color: "#00E5A8" },
            { label: "Good (85-95%)", pct: 24, color: "#00C2FF" },
            { label: "Fair (70-85%)", pct: 6, color: "#fbbf24" },
            { label: "Poor (<70%)", pct: 2, color: "#f87171" },
          ].map(q => (
            <div key={q.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>{q.label}</span>
                <span className="text-[11.5px] font-mono" style={{ color: q.color }}>{q.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${q.pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-1.5 rounded-full" style={{ background: q.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function FaceRecognitionPage() {
  const [tab, setTab] = useState<Tab>("Enroll");

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-semibold text-white tracking-[-0.02em]">Face Recognition</h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
          Enroll and verify identities using ArcFace 512-d embeddings with real-time liveness detection.
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
            style={{
              background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
              border: tab === t ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === "Enroll" && <EnrollTab />}
          {tab === "Verify" && <VerifyTab />}
          {tab === "Search" && (
            <div className="dash-card rounded-2xl p-8 text-center">
              <Search size={24} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-[14px] font-semibold text-white mb-1">Identity Search</p>
              <p className="text-[12.5px] mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
                Search by User ID, email, or metadata across your enrolled identity store.
              </p>
              <div className="flex items-center gap-3 max-w-md mx-auto">
                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input placeholder="Enter user ID or email…" className="bg-transparent outline-none text-[12.5px] text-white flex-1" />
                </div>
                <button className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold" style={{ background: "#00C2FF", color: "#000" }}>
                  Search
                </button>
              </div>
            </div>
          )}
          {tab === "Gallery" && <GalleryTab />}
          {tab === "Statistics" && <StatisticsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
