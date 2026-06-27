"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanFace,
  Fingerprint,
  Camera,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Shield,
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock,
  Activity,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { terminalApi } from "@/lib/api";
import { format } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────────────

type Mode = "face" | "fingerprint";
type ScanState = "idle" | "scanning" | "processing" | "match" | "no-match" | "error";

interface IdentityResult {
  identified: boolean;
  confidence: number;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    is_enrolled: boolean;
    is_fingerprint_enrolled: boolean;
    face_embedding_count: number;
    created_at: string | null;
    last_login: string | null;
  } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

function base64urlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function getRoleBadgeColor(role: string) {
  switch (role?.toLowerCase()) {
    case "super_admin": return "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20";
    case "admin": return "bg-[#0EA5E9]/10 text-[#38BDF8] border-[#0EA5E9]/20";
    case "org_admin": return "bg-[#8B5CF6]/10 text-[#A78BFA] border-[#8B5CF6]/20";
    default: return "bg-white/5 text-white/50 border-white/10";
  }
}

function ConfidenceArc({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#00E5A8" : score >= 60 ? "#f59e0b" : "#f87171";

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth="6" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.34,1.56,.64,1)" }}
        />
      </svg>
      <span className="relative text-lg font-bold text-white">{score.toFixed(0)}%</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrustTerminal() {
  const [mode, setMode] = useState<Mode>("face");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<IdentityResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanLine, setScanLine] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Camera management ──────────────────────────────────────────────────────

  const setVideoEl = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      toast.error("Camera access denied. Allow camera permissions to use Face scan.");
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (mode === "face") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // ── Scan countdown ─────────────────────────────────────────────────────────

  const startCountdown = () => {
    setScanState("scanning");
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        setCountdown(null);
        captureAndIdentify();
      }
    }, 1000);
  };

  // ── Face capture + identify ────────────────────────────────────────────────

  const captureAndIdentify = async () => {
    setScanState("processing");
    setScanLine(true);
    setTimeout(() => setScanLine(false), 2000);

    const video = videoRef.current;
    if (!video) {
      setScanState("error");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setScanState("error"); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const fd = new FormData();
      fd.append("image", dataURLtoFile(dataUrl, `terminal_scan_${Date.now()}.jpg`));
      const { data } = await terminalApi.identifyByFace(fd);
      setResult(data);
      setScanState(data.identified ? "match" : "no-match");
    } catch (err: any) {
      console.error("Terminal scan failed:", err);
      const msg = err.response?.data?.detail || "Verification request failed.";
      toast.error(msg);
      setScanState("error");
    }
  };

  // ── Fingerprint identify ───────────────────────────────────────────────────

  const identifyByFingerprint = async () => {
    setScanState("processing");
    try {
      const res = await terminalApi.fingerprintBegin();
      const options = res.data;

      options.challenge = base64urlToBytes(options.challenge);
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((c: any) => ({
          ...c,
          id: base64urlToBytes(c.id),
        }));
      }

      const assertion = (await navigator.credentials.get({ publicKey: options })) as any;
      if (!assertion) throw new Error("No assertion returned by authenticator");

      const body = {
        credential_id: assertion.id,
        raw_id: bytesToBase64url(assertion.rawId),
        response: {
          clientDataJSON: bytesToBase64url(assertion.response.clientDataJSON),
          authenticatorData: bytesToBase64url(assertion.response.authenticatorData),
          signature: bytesToBase64url(assertion.response.signature),
          userHandle: assertion.response.userHandle
            ? bytesToBase64url(assertion.response.userHandle)
            : null,
        },
        type: assertion.type,
      };

      const { data } = await terminalApi.fingerprintComplete(body as any);

      // terminal/complete returns {identified, confidence, message, user}
      setResult(data as IdentityResult);
      setScanState(data.identified ? "match" : "no-match");
    } catch (err: any) {
      console.error("Fingerprint identification failed:", err);
      const msg = err.response?.data?.detail || err.message || "Fingerprint scan failed or was cancelled.";
      if (err.name !== "NotAllowedError") toast.error(msg);
      setScanState("error");
    }
  };

  const reset = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setScanState("idle");
    setResult(null);
    setCountdown(null);
    setScanLine(false);
    if (mode === "face") startCamera();
  };

  const isProcessing = scanState === "scanning" || scanState === "processing";

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E5A8]/20 bg-[#00E5A8]/10">
          <ScanFace className="h-5 w-5 text-[#00E5A8]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Trust Terminal</h1>
          <p className="text-xs text-white/40">Biometric identity verification · Admin access only</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5A8]">Live</span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5">
        {([
          { key: "face" as Mode, icon: ScanFace, label: "Face Scan", sub: "ArcFace 1:N matching" },
          { key: "fingerprint" as Mode, icon: Fingerprint, label: "Fingerprint", sub: "WebAuthn passkey lookup" },
        ] as const).map(({ key, icon: Icon, label, sub }) => (
          <button
            key={key}
            onClick={() => { setMode(key); reset(); }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all",
              mode === key
                ? "bg-[#00E5A8]/10 border border-[#00E5A8]/20 text-[#00E5A8]"
                : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <div>
              <p className="text-[12.5px] font-semibold">{label}</p>
              <p className="text-[10px] opacity-60">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: Scanner Panel */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#0a0a0a]">
            {/* Scanner Area */}
            <div className="relative aspect-[4/3] w-full bg-black overflow-hidden">
              {mode === "face" ? (
                <>
                  {cameraReady && (scanState === "idle" || scanState === "scanning" || scanState === "processing") ? (
                    <video
                      ref={setVideoEl}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover scale-x-[-1]"
                      onLoadedMetadata={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/90">
                      {scanState === "match" || scanState === "no-match" || scanState === "error" ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center gap-3"
                        >
                          {scanState === "match" ? (
                            <CheckCircle2 className="h-16 w-16 text-[#00E5A8]" />
                          ) : (
                            <XCircle className="h-16 w-16 text-[#f87171]" />
                          )}
                          <span className="text-sm font-semibold text-white">
                            {scanState === "match" ? "Identity Verified" : "No Match Found"}
                          </span>
                        </motion.div>
                      ) : (
                        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
                      )}
                    </div>
                  )}

                  {/* Scan overlay when active */}
                  {(scanState === "idle" || scanState === "scanning") && cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Face oval guide */}
                      <div className={cn(
                        "h-[200px] w-[160px] rounded-full border-2 border-dashed transition-colors duration-300",
                        scanState === "scanning" ? "border-[#00E5A8]/80 animate-pulse" : "border-white/20"
                      )} />

                      {/* Countdown */}
                      {countdown !== null && (
                        <motion.span
                          key={countdown}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="absolute text-5xl font-black text-[#00E5A8] drop-shadow-lg"
                        >
                          {countdown || "📸"}
                        </motion.span>
                      )}
                    </div>
                  )}

                  {/* Scan line animation */}
                  {scanLine && (
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E5A8] to-transparent pointer-events-none"
                      style={{ position: "absolute" }}
                    />
                  )}

                  {/* Processing overlay */}
                  {scanState === "processing" && (
                    <div className="absolute inset-0 bg-[#00E5A8]/5 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
                        <span className="text-xs font-medium text-[#00E5A8]">Matching identity…</span>
                      </div>
                    </div>
                  )}

                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-[#00E5A8]/40 rounded-tl-md pointer-events-none" />
                  <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-[#00E5A8]/40 rounded-tr-md pointer-events-none" />
                  <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-[#00E5A8]/40 rounded-bl-md pointer-events-none" />
                  <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-[#00E5A8]/40 rounded-br-md pointer-events-none" />
                </>
              ) : (
                /* Fingerprint mode */
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#0d0d0d] to-black">
                  <motion.div
                    animate={scanState === "processing" ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="relative"
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-2xl transition-colors duration-500",
                      scanState === "match" ? "bg-[#00E5A8]/20" : scanState === "no-match" ? "bg-[#f87171]/20" : "bg-[#0EA5E9]/10"
                    )} />
                    <div className={cn(
                      "relative flex h-24 w-24 items-center justify-center rounded-full border-2",
                      scanState === "match" ? "border-[#00E5A8]/40 bg-[#00E5A8]/10" : scanState === "no-match" ? "border-[#f87171]/40 bg-[#f87171]/10" : "border-[#0EA5E9]/30 bg-[#0EA5E9]/5"
                    )}>
                      {scanState === "match" ? (
                        <CheckCircle2 className="h-10 w-10 text-[#00E5A8]" />
                      ) : scanState === "no-match" || scanState === "error" ? (
                        <XCircle className="h-10 w-10 text-[#f87171]" />
                      ) : (
                        <Fingerprint className={cn("h-10 w-10", scanState === "processing" ? "text-[#0EA5E9] animate-pulse" : "text-[#0EA5E9]")} />
                      )}
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">
                      {scanState === "idle" && "Fingerprint Scanner"}
                      {scanState === "processing" && "Scanning…"}
                      {scanState === "match" && "Identity Verified"}
                      {scanState === "no-match" && "No Match Found"}
                      {scanState === "error" && "Scan Failed"}
                    </p>
                    <p className="text-[11px] text-white/35 mt-1">
                      {scanState === "idle" && "Uses device Touch ID or Windows Hello"}
                      {scanState === "processing" && "Place finger on scanner"}
                      {(scanState === "match" || scanState === "no-match") && "Scan complete"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-white/[0.05] bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] text-white/30">
                <Activity className="h-3.5 w-3.5" />
                <span>
                  {scanState === "idle" && "Ready"}
                  {scanState === "scanning" && `Capturing in ${countdown}s…`}
                  {scanState === "processing" && "Running AI matching…"}
                  {scanState === "match" && "Match confirmed"}
                  {scanState === "no-match" && "No identity found"}
                  {scanState === "error" && "Error — retry"}
                </span>
              </div>

              <div className="flex gap-2">
                {(scanState === "match" || scanState === "no-match" || scanState === "error") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={reset}
                    className="h-7 gap-1.5 border-white/10 text-[11px] text-white/50 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" /> New Scan
                  </Button>
                )}

                {scanState === "idle" && (
                  <Button
                    size="sm"
                    onClick={mode === "face" ? startCountdown : identifyByFingerprint}
                    disabled={mode === "face" && !cameraReady}
                    className={cn(
                      "h-7 gap-1.5 text-[11px] font-semibold",
                      mode === "face"
                        ? "bg-[#00E5A8] hover:bg-[#00c590] text-black"
                        : "bg-[#0EA5E9] hover:bg-[#0284c7] text-white"
                    )}
                  >
                    {mode === "face"
                      ? <><ScanFace className="h-3.5 w-3.5" /> Capture & Identify</>
                      : <><Fingerprint className="h-3.5 w-3.5" /> Scan Fingerprint</>
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-2">
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Instructions</p>
            {mode === "face" ? (
              <ul className="space-y-1.5 text-[11.5px] text-white/40">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#00E5A8]/50" />Position the person's face within the oval guide</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#00E5A8]/50" />Ensure good lighting — avoid backlighting</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#00E5A8]/50" />Click "Capture & Identify" — 3-second countdown will run</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#00E5A8]/50" />AI runs 1:N face matching across all enrolled users</li>
              </ul>
            ) : (
              <ul className="space-y-1.5 text-[11.5px] text-white/40">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0EA5E9]/50" />Click "Scan Fingerprint" to begin WebAuthn challenge</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0EA5E9]/50" />Person places finger on device biometric scanner</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0EA5E9]/50" />Browser native (Touch ID / Windows Hello) processes scan</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[#0EA5E9]/50" />No raw fingerprint data ever leaves the device</li>
              </ul>
            )}
          </div>
        </div>

        {/* Right: Result Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[18px] border border-dashed border-white/[0.07] bg-white/[0.01] text-center p-8"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                  <User className="h-6 w-6 text-white/20" />
                </div>
                <p className="text-sm font-semibold text-white/30">No Identity Scanned</p>
                <p className="mt-1 text-[11px] text-white/20 max-w-[220px]">
                  Run a face scan or fingerprint check — the identified person's profile will appear here
                </p>

                {isProcessing && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
                    <span className="text-xs text-white/40">
                      {scanState === "scanning" ? "Countdown…" : "Running identity check…"}
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "overflow-hidden rounded-[18px] border",
                  result.identified
                    ? "border-[#00E5A8]/20 bg-gradient-to-b from-[#00E5A8]/[0.04] to-transparent"
                    : "border-[#f87171]/20 bg-gradient-to-b from-[#f87171]/[0.04] to-transparent"
                )}
              >
                {/* Result header */}
                <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    {result.identified ? (
                      <CheckCircle2 className="h-5 w-5 text-[#00E5A8]" />
                    ) : (
                      <XCircle className="h-5 w-5 text-[#f87171]" />
                    )}
                    <div>
                      <p className="text-[13px] font-bold text-white">
                        {result.identified ? "Identity Confirmed" : "Identity Unknown"}
                      </p>
                      <p className="text-[10.5px] text-white/35">{result.message}</p>
                    </div>
                  </div>

                  {result.identified && (
                    <ConfidenceArc score={result.confidence} />
                  )}
                </div>

                {result.user ? (
                  <div className="p-5 space-y-4">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#00E5A8]/30 bg-[#00E5A8]/10 text-xl font-bold text-[#00E5A8]">
                        {result.user.name?.charAt(0)?.toUpperCase() || "?"}
                        <span className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0d0d0d]",
                          result.user.is_active ? "bg-[#00E5A8]" : "bg-[#f87171]"
                        )} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-white">{result.user.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="h-3 w-3 text-white/30" />
                          <span className="text-[11px] text-white/50">{result.user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold",
                        getRoleBadgeColor(result.user.role)
                      )}>
                        <Shield className="h-3 w-3" />
                        {result.user.role?.replace("_", " ").toUpperCase() || "MEMBER"}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        result.user.is_active
                          ? "border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]"
                          : "border-[#f87171]/20 bg-[#f87171]/5 text-[#f87171]"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", result.user.is_active ? "bg-[#00E5A8]" : "bg-[#f87171]")} />
                        {result.user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Biometric status */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5",
                        result.user.is_enrolled
                          ? "border-[#00E5A8]/15 bg-[#00E5A8]/5"
                          : "border-white/[0.06] bg-white/[0.02]"
                      )}>
                        <Camera className={cn("h-3.5 w-3.5", result.user.is_enrolled ? "text-[#00E5A8]" : "text-white/20")} />
                        <div>
                          <p className="text-[10px] font-semibold text-white/60">Face ID</p>
                          <p className={cn("text-[9.5px]", result.user.is_enrolled ? "text-[#00E5A8]" : "text-white/30")}>
                            {result.user.is_enrolled ? `${result.user.face_embedding_count} templates` : "Not enrolled"}
                          </p>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5",
                        result.user.is_fingerprint_enrolled
                          ? "border-[#0EA5E9]/15 bg-[#0EA5E9]/5"
                          : "border-white/[0.06] bg-white/[0.02]"
                      )}>
                        <Fingerprint className={cn("h-3.5 w-3.5", result.user.is_fingerprint_enrolled ? "text-[#38BDF8]" : "text-white/20")} />
                        <div>
                          <p className="text-[10px] font-semibold text-white/60">Fingerprint</p>
                          <p className={cn("text-[9.5px]", result.user.is_fingerprint_enrolled ? "text-[#38BDF8]" : "text-white/30")}>
                            {result.user.is_fingerprint_enrolled ? "Enrolled" : "Not enrolled"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/35 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Joined</span>
                        <span className="text-white/60 font-medium">
                          {result.user.created_at
                            ? format(new Date(result.user.created_at), "MMM d, yyyy")
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/35 flex items-center gap-1.5"><Zap className="h-3 w-3" /> User ID</span>
                        <span className="font-mono text-[10px] text-white/40">{result.user.id.slice(0, 8)}…</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-white/35 flex items-center gap-1.5"><Lock className="h-3 w-3" /> Confidence</span>
                        <span className={cn(
                          "font-bold",
                          result.confidence >= 80 ? "text-[#00E5A8]" : result.confidence >= 60 ? "text-[#f59e0b]" : "text-[#f87171]"
                        )}>
                          {result.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <AlertTriangle className="h-8 w-8 text-[#f87171]/60" />
                    <p className="text-sm text-white/40">
                      {result.message || "No enrolled face or fingerprint matched."}
                    </p>
                    <p className="text-[11px] text-white/25">
                      Ensure the person is enrolled in the system before scanning.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
            <Shield className="h-4 w-4 text-[#00E5A8]/60 shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-white/30 leading-relaxed">
              <strong className="text-white/50">Admin use only.</strong> All scans are logged in the audit trail. 
              Raw biometric data never leaves the device. Face matching is done server-side against encrypted embeddings only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
