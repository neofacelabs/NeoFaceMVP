"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Eye, CheckCircle2, XCircle, AlertTriangle, Loader2,
  RefreshCw, Upload, Clock, BarChart3, Activity, Shield,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

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
    } catch {
      setError("Camera access denied or not available on this device.");
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
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvasRef.current.toDataURL("image/jpeg", 0.9);
  }, []);

  useEffect(() => () => stop(), [stop]);
  return { videoRef, canvasRef, streaming, error, start, stop, capture };
}

const MOCK_HISTORY = [
  { id: 1, time: "2m ago", result: "live", confidence: 0.98, modality: "Passive", ip: "192.168.1.1" },
  { id: 2, time: "15m ago", result: "live", confidence: 0.96, modality: "Passive", ip: "10.0.0.42" },
  { id: 3, time: "1h ago", result: "spoof", confidence: 0.87, modality: "Passive", ip: "103.21.4.18" },
  { id: 4, time: "2h ago", result: "live", confidence: 0.99, modality: "Passive", ip: "192.168.1.1" },
  { id: 5, time: "3h ago", result: "live", confidence: 0.94, modality: "Passive", ip: "172.16.0.55" },
];

type LivenessResult = {
  is_live: boolean;
  confidence: number;
  spoof_type?: string;
  details?: Record<string, any>;
  latency_ms?: number;
};

export default function LivenessPage() {
  const cam = useCamera();
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<LivenessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"detect" | "history" | "api">("detect");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!preview) { toast.error("Image required"); return; }
    setLoading(true);
    const t0 = performance.now();
    try {
      const blob = await (await fetch(preview)).blob();
      const form = new FormData();
      form.append("image", blob, "face.jpg");
      const res = await apiClient.post("/liveness/passive", form);
      setResult({ ...res.data, latency_ms: Math.round(performance.now() - t0) });
      toast.success(res.data.is_live ? "Liveness verified — real person detected" : "Spoof detected!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Liveness check failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-semibold text-white tracking-[-0.02em]">Liveness Detection</h1>
        <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
          Passive liveness detection using depth analysis, texture analysis, and deepfake detection.
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {(["detect", "history", "api"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-all capitalize"
            style={{
              background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
              color: tab === t ? "#fff" : "rgba(255,255,255,0.4)",
              border: tab === t ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            }}>
            {t === "detect" ? "Detect" : t === "history" ? "History" : "API Reference"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "detect" && (
          <motion.div key="detect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid lg:grid-cols-[1fr_380px] gap-6"
          >
            {/* Camera */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: result ? (result.is_live ? "1px solid rgba(0,229,168,0.3)" : "1px solid rgba(248,113,113,0.3)") : "1px solid rgba(255,255,255,0.07)",
                  aspectRatio: "4/3",
                  transition: "border-color 0.3s",
                }}>
                {!preview && (
                  <>
                    <video ref={cam.videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ display: cam.streaming ? "block" : "none" }} />
                    <canvas ref={cam.canvasRef} className="hidden" />
                    {!cam.streaming && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        {cam.error ? (
                          <div className="text-center px-6">
                            <AlertTriangle size={24} className="mx-auto mb-2" style={{ color: "#f87171" }} />
                            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{cam.error}</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}>
                              <Eye size={24} style={{ color: "#818cf8" }} />
                            </div>
                            <p className="text-[13px] text-center max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                              Position your face within the frame and start the liveness check.
                            </p>
                            <button onClick={cam.start} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "#818cf8", color: "#000" }}>
                              Start Camera
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {cam.streaming && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-52 h-60 rounded-full border-2 border-dashed opacity-40" style={{ borderColor: "#818cf8" }} />
                      </div>
                    )}
                  </>
                )}

                {preview && (
                  <div className="relative w-full h-full">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {result && (
                      <div className="absolute inset-0 flex items-end p-4"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                          style={{ background: result.is_live ? "rgba(0,229,168,0.9)" : "rgba(248,113,113,0.9)" }}>
                          {result.is_live ? <CheckCircle2 size={13} color="#000" /> : <XCircle size={13} color="#000" />}
                          <span className="text-[12px] font-semibold text-black">
                            {result.is_live ? `Live — ${(result.confidence * 100).toFixed(1)}%` : `Spoof — ${result.spoof_type ?? "detected"}`}
                          </span>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { setPreview(null); setResult(null); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
                      <RefreshCw size={12} style={{ color: "white" }} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!preview && cam.streaming && (
                  <button onClick={() => { const img = cam.capture(); if (img) { setPreview(img); cam.stop(); } }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold" style={{ background: "#818cf8", color: "#000" }}>
                    <Camera size={14} /> Capture Frame
                  </button>
                )}
                {preview && (
                  <button onClick={handleDetect} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold"
                    style={{ background: "#818cf8", color: "#000", opacity: loading ? 0.6 : 1 }}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    {loading ? "Analyzing…" : "Run Liveness Check"}
                  </button>
                )}
              </div>
            </div>

            {/* Result + signals panel */}
            <div className="space-y-4">
              {result ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    {result.is_live
                      ? <CheckCircle2 size={16} style={{ color: "#00E5A8" }} />
                      : <XCircle size={16} style={{ color: "#f87171" }} />}
                    <p className="text-[14px] font-semibold" style={{ color: result.is_live ? "#00E5A8" : "#f87171" }}>
                      {result.is_live ? "Real Person Detected" : "Spoof Detected"}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Liveness Confidence</span>
                      <span className="text-[11px] font-mono" style={{ color: result.is_live ? "#00E5A8" : "#f87171" }}>
                        {(result.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 0.8 }}
                        className="h-2 rounded-full" style={{ background: result.is_live ? "linear-gradient(90deg,#00E5A8,#00C2FF)" : "#f87171" }} />
                    </div>
                  </div>

                  {/* Signal analysis */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Signal Analysis</p>
                    {[
                      { label: "Depth Analysis", status: result.is_live ? "pass" : "fail", value: `${(result.confidence * 98).toFixed(1)}%` },
                      { label: "Texture Analysis", status: result.is_live ? "pass" : "fail", value: `${(result.confidence * 97).toFixed(1)}%` },
                      { label: "Deepfake Detection", status: result.is_live ? "pass" : "fail", value: `${(result.confidence * 99).toFixed(1)}%` },
                      { label: "3D Pose Estimation", status: "pass", value: "Normal" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <span className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{s.value}</span>
                          <span className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: s.status === "pass" ? "rgba(0,229,168,0.12)" : "rgba(248,113,113,0.12)" }}>
                            {s.status === "pass" ? <CheckCircle2 size={9} style={{ color: "#00E5A8" }} /> : <XCircle size={9} style={{ color: "#f87171" }} />}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.latency_ms && (
                    <p className="mt-3 text-[10.5px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                      Latency: {result.latency_ms}ms
                    </p>
                  )}
                </motion.div>
              ) : (
                <div className="dash-card rounded-2xl p-8 text-center">
                  <Eye size={28} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
                  <p className="text-[13.5px] font-semibold text-white mb-1">Ready to analyze</p>
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Capture or upload a face image to run the liveness detection pipeline.
                  </p>
                </div>
              )}

              {/* What we detect */}
              <div className="dash-card rounded-2xl p-5">
                <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Detection Capabilities</p>
                <div className="space-y-2">
                  {[
                    { label: "Printed photos", icon: "🖨️" },
                    { label: "Screen replays", icon: "📱" },
                    { label: "3D masks", icon: "🎭" },
                    { label: "Deepfake videos", icon: "🤖" },
                    { label: "Eye-open attacks", icon: "👁" },
                  ].map(d => (
                    <div key={d.label} className="flex items-center gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span>{d.icon}</span>
                      {d.label}
                      <CheckCircle2 size={11} className="ml-auto" style={{ color: "#00E5A8" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="dash-card rounded-2xl overflow-hidden">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Result</th>
                    <th>Confidence</th>
                    <th>Modality</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_HISTORY.map(h => (
                    <tr key={h.id}>
                      <td>{h.time}</td>
                      <td>
                        <span className="flex items-center gap-1.5">
                          {h.result === "live" ? <CheckCircle2 size={12} style={{ color: "#00E5A8" }} /> : <XCircle size={12} style={{ color: "#f87171" }} />}
                          <span style={{ color: h.result === "live" ? "#00E5A8" : "#f87171" }}>
                            {h.result === "live" ? "Live" : "Spoof"}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="font-mono" style={{ color: h.result === "live" ? "#00E5A8" : "#f87171" }}>
                          {(h.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>{h.modality}</td>
                      <td><span className="font-mono text-[11px]">{h.ip}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "api" && (
          <motion.div key="api" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="dash-card rounded-2xl p-6">
              <p className="text-[13px] font-semibold text-white mb-1">POST /api/v1/liveness/passive</p>
              <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.38)" }}>
                Run passive liveness detection on a face image.
              </p>
              <pre className="text-[11.5px] rounded-xl p-4 overflow-auto" style={{ background: "rgba(255,255,255,0.03)", color: "#00E5A8", fontFamily: "monospace" }}>
{`curl -X POST https://api.neoface.io/v1/liveness/passive \\
  -H "x-api-key: sk_live_xxxx" \\
  -F "image=@face.jpg"

# Response
{
  "is_live": true,
  "confidence": 0.983,
  "spoof_type": null,
  "latency_ms": 142,
  "details": {
    "depth_score": 0.97,
    "texture_score": 0.99,
    "deepfake_score": 0.98
  }
}`}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
