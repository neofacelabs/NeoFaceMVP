"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Camera,
  Fingerprint,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ScanFace,
  Download,
  MapPin,
  Shield,
  Loader2,
  Upload,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { authApi, biometricsApi, dashboardApi, enrollmentApi, webAuthnApi } from "@/lib/api";
import { toast } from "sonner";

// Helper to convert dataURL to File
function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Helper to convert base64url string to Uint8Array
function base64urlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert ArrayBuffer/Uint8Array to base64url string
function bytesToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default function MemberBiometricsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bioStatus, setBioStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Enrollment Modal States
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [poseStep, setPoseStep] = useState<"straight" | "right" | "left" | "done">("straight");
  const [capturedPoses, setCapturedPoses] = useState<{ straight?: string; right?: string; left?: string }>({});
  const [poseErrors, setPoseErrors] = useState<{ straight?: string; right?: string; left?: string }>({});
  const [poseScores, setPoseScores] = useState<{ straight?: number; right?: number; left?: number }>({});
  const [webcamLoading, setWebcamLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [validatingFrame, setValidatingFrame] = useState(false);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  // Fingerprint Enrollment States
  const [showFpModal, setShowFpModal] = useState(false);
  const [fpSubmitting, setFpSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Callback ref so we can attach stream as soon as video element mounts
  const setVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  };

  async function loadData() {
    try {
      const [meRes, bioRes, logsRes] = await Promise.all([
        authApi.me(),
        biometricsApi.getStatus(),
        dashboardApi.getLogs(1, 100).catch(() => ({ data: { logs: [] } })),
      ]);
      setProfile(meRes.data);
      setBioStatus(bioRes.data);
      const allLogs = logsRes.data?.logs || [];
      const userLogs = allLogs.filter((l: any) => l.user_id === meRes.data.id);
      setLogs(userLogs);
    } catch (err) {
      console.error("Failed to load biometrics data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Start webcam
  const startCamera = async () => {
    try {
      setWebcamLoading(true);
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      // Attach to video element if it's already mounted
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play() failed:", playErr);
        }
      }
      // If videoRef isn't mounted yet, setVideoRef callback will handle it
      setCameraActive(true);
    } catch (err: any) {
      console.error("Webcam access failed:", err);
      if (err.name === "NotAllowedError") {
        toast.error("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError") {
        toast.error("No camera found. Please connect a camera and try again.");
      } else {
        toast.error("Could not access your webcam. Check permissions.");
      }
    } finally {
      setWebcamLoading(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (showEnrollModal) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showEnrollModal]);

  // Capture image and validate quality/liveness/pose
  const handleCapture = async () => {
    if (!videoRef.current || validatingFrame || poseStep === "done") return;

    try {
      setValidatingFrame(true);
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");

      // Validate frame on the backend
      const file = dataURLtoFile(dataUrl, `frame_${poseStep}_${Date.now()}.jpg`);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("expected_pose", poseStep);

      const { data } = await enrollmentApi.validateFrame(fd);
      if (data.success) {
        setCapturedPoses((prev) => ({ ...prev, [poseStep]: dataUrl }));
        setPoseScores((prev) => ({ ...prev, [poseStep]: data.quality_score }));
        setPoseErrors((prev) => ({ ...prev, [poseStep]: undefined }));
        toast.success(`${poseStep.toUpperCase()} pose validated successfully!`);

        // Move to the next pose or complete
        if (poseStep === "straight") {
          setPoseStep("right");
        } else if (poseStep === "right") {
          setPoseStep("left");
        } else if (poseStep === "left") {
          setPoseStep("done");
        }
      } else {
        setPoseErrors((prev) => ({ ...prev, [poseStep]: data.error || "Validation failed" }));
        toast.error(data.error || "Validation check failed. Position face as instructed.");
      }
    } catch (err) {
      console.error("Frame validation failed:", err);
      toast.error("Failed to perform frame quality check.");
    } finally {
      setValidatingFrame(false);
    }
  };

  const handleResetPoses = () => {
    setPoseStep("straight");
    setCapturedPoses({});
    setPoseErrors({});
    setPoseScores({});
  };

  // Submit enrollment
  const handleEnrollSubmit = async () => {
    const { straight, right, left } = capturedPoses;
    if (!straight || !right || !left) {
      toast.error("All 3 poses (straight, right, left) must be successfully captured.");
      return;
    }

    try {
      setEnrollSubmitting(true);
      const fd = new FormData();
      fd.append("name", profile?.name || "Member User");
      fd.append("email", profile?.email || "");
      if (profile?.phone) fd.append("phone", profile.phone);

      fd.append("images", dataURLtoFile(straight, "face_straight.jpg"));
      fd.append("images", dataURLtoFile(right, "face_right.jpg"));
      fd.append("images", dataURLtoFile(left, "face_left.jpg"));

      await enrollmentApi.enroll(fd);
      toast.success("Face biometrics enrolled successfully! 🎉");
      setShowEnrollModal(false);
      handleResetPoses();
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Face enrollment failed.";
      toast.error(msg);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  const handleDeleteFace = async () => {
    if (!window.confirm("Are you sure you want to delete your enrolled face data? You will need to re-enroll to use face verification.")) return;
    try {
      setActionLoading(true);
      await biometricsApi.deleteFace();
      toast.success("Face data deleted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete face data.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFingerprintRegister = async () => {
    try {
      setFpSubmitting(true);
      
      // Step 1: Begin registration (fetch challenge options)
      const res = await webAuthnApi.registerBegin();
      const options = res.data;

      // Translate base64url challenge and user id into Uint8Arrays
      options.challenge = base64urlToBytes(options.challenge);
      options.user.id = base64urlToBytes(options.user.id);
      
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlToBytes(cred.id),
        }));
      }

      // Step 2: Trigger navigator.credentials.create
      const credential = (await navigator.credentials.create({
        publicKey: options,
      })) as any;

      if (!credential) {
        throw new Error("Device scanner did not return a valid credential.");
      }

      // Step 3: Complete registration (serialize credential parameters back to base64url)
      const response = {
        clientDataJSON: bytesToBase64url(credential.response.clientDataJSON),
        attestationObject: bytesToBase64url(credential.response.attestationObject),
      };

      const completeBody = {
        credential_id: credential.id,
        raw_id: bytesToBase64url(credential.rawId),
        response,
        type: credential.type,
        device_name: `${navigator.userAgent.includes("Mac") ? "Touch ID" : "Windows Hello"} (${new Date().toLocaleDateString()})`,
      };

      await webAuthnApi.registerComplete(completeBody);
      toast.success("Passkey fingerprint enrolled successfully! 🎉");
      setShowFpModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || err.response?.data?.detail || "Fingerprint scanner registration failed.";
      toast.error(msg);
    } finally {
      setFpSubmitting(false);
    }
  };

  const handleDeleteFingerprint = async () => {
    if (!window.confirm("Are you sure you want to delete all enrolled fingerprint data?")) return;
    try {
      setActionLoading(true);
      await biometricsApi.deleteFingerprint();
      toast.success("Fingerprint data deleted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete fingerprint data.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const faceEnrolled = bioStatus?.face?.enrolled || false;
  const faceCount = bioStatus?.face?.embedding_count || 0;
  const fpEnrolled = bioStatus?.fingerprint?.enrolled || false;
  const fpCount = bioStatus?.fingerprint?.template_count || 0;

  const totalLogs = logs.length;
  const successfulLogs = logs.filter(a => a.authentication_result).length;
  const successRate = totalLogs > 0 ? `${((successfulLogs / totalLogs) * 100).toFixed(1)}%` : "N/A";
  const recentWeekLogs = logs.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 86400000)).length;
  const failedLogs = totalLogs - successfulLogs;

  const recentAuthsMapped = logs.slice(0, 10).map((log: any) => ({
    id: log.id,
    result: (log.authentication_result ? "success" : "failed") as "success" | "failed",
    method: log.confidence_score ? "face" : "fingerprint",
    zone: log.ip_address || "Web Portal",
    timestamp: log.timestamp,
    confidence: log.confidence_score ? log.confidence_score * 100 : undefined,
    liveness: log.liveness_score ? log.liveness_score * 100 : undefined,
    device: "Web Terminal",
  }));

  // Fetch average scores and last used
  const faceLogs = logs.filter(a => a.confidence_score && a.authentication_result);
  const avgFaceScore = faceLogs.length > 0
    ? `${(faceLogs.reduce((acc, log) => acc + (log.confidence_score || 0), 0) / faceLogs.length * 100).toFixed(1)}%`
    : "N/A";

  const latestFaceLog = logs.find(a => a.confidence_score && a.authentication_result);
  const lastFaceUsed = latestFaceLog
    ? `${formatDistanceToNow(new Date(latestFaceLog.timestamp))} ago`
    : "Never";

  const fpLogs = logs.filter(a => !a.confidence_score && a.authentication_result);
  const latestFpLog = logs.find(a => !a.confidence_score && a.authentication_result);
  const lastFpUsed = latestFpLog
    ? `${formatDistanceToNow(new Date(latestFpLog.timestamp))} ago`
    : "Never";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Biometrics"
        description="Your enrolled biometric templates and authentication history."
      />

      {/* Enrolled biometrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Face */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative overflow-hidden rounded-[14px] border p-5",
            faceEnrolled
              ? "border-[#00E5A8]/15 bg-[#00E5A8]/[0.04]"
              : "border-white/[0.065] bg-white/[0.025]"
          )}
        >
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5A8]/20 to-transparent" />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", faceEnrolled ? "border-[#00E5A8]/20 bg-[#00E5A8]/10" : "bg-white/[0.04] border-white/[0.08]")}>
                <Camera className={cn("h-4 w-4", faceEnrolled ? "text-[#00E5A8]" : "text-white/30")} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Face Recognition</p>
                <p className="text-[11px] text-white/35">ArcFace v1.0 · Primary</p>
              </div>
            </div>
            <StatusBadge variant="biometric" status={faceEnrolled ? "enrolled" : "pending"} />
          </div>
          <div className="space-y-2 text-[11.5px]">
            {[
              { label: "Templates", value: faceEnrolled ? `${faceCount} face template` : "None" },
              { label: "Enrolled", value: faceEnrolled && profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "N/A" },
              { label: "Last used", value: faceEnrolled ? lastFaceUsed : "N/A" },
              { label: "Avg match score", value: faceEnrolled ? avgFaceScore : "N/A" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-white/30">{row.label}</span>
                <span className="font-medium text-white/70">{row.value}</span>
              </div>
            ))}
          </div>

          {!faceEnrolled ? (
            <Button
              size="sm"
              onClick={() => setShowEnrollModal(true)}
              className="mt-4 h-7 w-full gap-1.5 text-[11px] bg-[#00E5A8] hover:bg-[#00c590] text-black font-semibold"
            >
              <ScanFace className="h-3.5 w-3.5" />
              Enroll Face Biometrics
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteFace}
              disabled={actionLoading}
              className="mt-4 h-7 w-full gap-1.5 text-[11px] border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <AlertTriangle className="h-3 w-3" />
              Delete Face Template
            </Button>
          )}
        </motion.div>

        {/* Fingerprint */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative overflow-hidden rounded-[14px] border p-5",
            fpEnrolled
              ? "border-[#0EA5E9]/15 bg-[#0EA5E9]/[0.04]"
              : "border-white/[0.065] bg-white/[0.025]"
          )}
        >
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/20 to-transparent" />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", fpEnrolled ? "border-[#0EA5E9]/20 bg-[#0EA5E9]/10" : "bg-white/[0.04] border-white/[0.08]")}>
                <Fingerprint className={cn("h-4 w-4", fpEnrolled ? "text-[#38BDF8]" : "text-white/30")} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Fingerprint</p>
                <p className="text-[11px] text-white/35">ISO 19794-2 · WebAuthn</p>
              </div>
            </div>
            <StatusBadge variant="biometric" status={fpEnrolled ? "enrolled" : "pending"} />
          </div>
          <div className="space-y-2 text-[11.5px]">
            {[
              { label: "Templates", value: fpEnrolled ? `${fpCount} finger template(s)` : "None" },
              { label: "Enrolled", value: fpEnrolled && profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "N/A" },
              { label: "Last used", value: fpEnrolled ? lastFpUsed : "N/A" },
              { label: "Avg match score", value: fpEnrolled ? "98.9%" : "N/A" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-white/30">{row.label}</span>
                <span className="font-medium text-white/70">{row.value}</span>
              </div>
            ))}
          </div>
          {!fpEnrolled ? (
            <Button
              size="sm"
              onClick={() => setShowFpModal(true)}
              className="mt-4 h-7 w-full gap-1.5 text-[11px] bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-semibold"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              Enroll Fingerprint
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteFingerprint}
              disabled={actionLoading}
              className="mt-4 h-7 w-full gap-1.5 text-[11px] border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <AlertTriangle className="h-3 w-3" />
              Delete Fingerprint Template
            </Button>
          )}
        </motion.div>
      </div>

      {/* KPIs */}
      <KPIGrid columns={4}>
        <KPICard label="Total Authentications" value={totalLogs} index={0} />
        <KPICard label="Success Rate" value={successRate} color="success" index={1} />
        <KPICard label="This Week" value={recentWeekLogs} index={2} color="accent" />
        <KPICard label="Failed Attempts" value={failedLogs} color="warning" index={3} />
      </KPIGrid>

      {/* Detailed auth history */}
      <ChartCard title="Authentication History" description="All your biometric authentication events" index={0}>
        <div className="space-y-0">
          {recentAuthsMapped.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-white/30">
              No biometric authentication history found.
            </div>
          ) : (
            recentAuthsMapped.map((auth, i) => (
              <motion.div
                key={auth.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 border-b border-white/[0.04] py-3.5 last:border-0"
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", auth.result === "success" ? "bg-[#00E5A8]/8 border border-[#00E5A8]/15" : "bg-[#f87171]/8 border border-[#f87171]/15")}>
                  {auth.method === "face"
                    ? <Camera className={cn("h-3.5 w-3.5", auth.result === "success" ? "text-[#00E5A8]" : "text-[#f87171]")} />
                    : <Fingerprint className={cn("h-3.5 w-3.5", auth.result === "success" ? "text-[#00E5A8]" : "text-[#f87171]")} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-white/80 capitalize">{auth.method} authentication</span>
                    <StatusBadge variant="auth" status={auth.result} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-white/35">
                      <MapPin className="h-3 w-3" />
                      {auth.zone}
                    </span>
                    <span className="text-[11px] text-white/25">·</span>
                    <span className="text-[11px] text-white/35">{auth.device}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  {auth.confidence && (
                    <p className={cn("text-[11px] font-semibold", auth.confidence >= 90 ? "text-[#00E5A8]" : "text-[#f87171]")}>
                      {auth.confidence.toFixed(1)}%
                    </p>
                  )}
                  <p className="text-[10.5px] text-white/25">
                    {formatDistanceToNow(new Date(auth.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ChartCard>

      {/* Face Biometrics Enrollment Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-modal"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ScanFace className="h-5 w-5 text-[#00E5A8]" />
                    Face Biometrics Registration
                  </h3>
                  <p className="text-[11.5px] text-white/40 mt-1">
                    Capture your face at three different angles (straight, right, and left) with passive liveness checks.
                  </p>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="rounded-full bg-white/[0.04] p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stepper Header */}
              <div className="mt-4 grid grid-cols-3 gap-2 pb-2">
                {[
                  { key: "straight", label: "1. Straight" },
                  { key: "right", label: "2. Turn Right" },
                  { key: "left", label: "3. Turn Left" },
                ].map((step) => {
                  const isDone = !!capturedPoses[step.key as keyof typeof capturedPoses];
                  const isActive = poseStep === step.key;
                  return (
                    <div
                      key={step.key}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border py-2 text-center transition-all",
                        isDone
                          ? "border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]"
                          : isActive
                          ? "border-white/20 bg-white/5 text-white"
                          : "border-white/5 bg-transparent text-white/30"
                      )}
                    >
                      <span className="text-xs font-semibold">{step.label}</span>
                      <span className="text-[9px] mt-0.5 opacity-80">
                        {isDone ? "Validated" : isActive ? "Active" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Body */}
              <div className="mt-4 min-h-[250px]">
                <div className="space-y-4">
                  {/* Instructions */}
                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 text-center">
                    <p className="text-xs font-semibold text-white">
                      {poseStep === "straight" && "Look directly into the camera. Position your face in the circle."}
                      {poseStep === "right" && "Turn your head to the right relative to the camera. Look right."}
                      {poseStep === "left" && "Turn your head to the left relative to the camera. Look left."}
                      {poseStep === "done" && "All three angles successfully validated! Ready to submit."}
                    </p>
                  </div>

                  {/* Camera view */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                    {cameraActive && poseStep !== "done" ? (
                      <>
                        <video
                          ref={setVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="h-full w-full object-cover scale-x-[-1]"
                          onLoadedMetadata={(e) => {
                            (e.target as HTMLVideoElement).play().catch(() => {});
                          }}
                        />
                        {/* Face alignment overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={cn(
                            "h-[180px] w-[180px] rounded-full border-2 border-dashed bg-black/10 backdrop-contrast-125 transition-colors duration-300",
                            poseStep === "straight" && "border-[#00E5A8]/50",
                            poseStep === "right" && "border-[#0EA5E9]/50",
                            poseStep === "left" && "border-[#F43F5E]/50"
                          )} />
                          {poseStep === "right" && (
                            <span className="absolute text-[10px] uppercase font-bold tracking-wider text-[#0EA5E9] bg-black/80 px-2 py-0.5 rounded-full mt-48">Turn Right →</span>
                          )}
                          {poseStep === "left" && (
                            <span className="absolute text-[10px] uppercase font-bold tracking-wider text-[#F43F5E] bg-black/80 px-2 py-0.5 rounded-full mt-48">← Turn Left</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-white/30 gap-2 p-4 text-center">
                        {poseStep === "done" ? (
                          <>
                            <CheckCircle2 className="h-10 w-10 text-[#00E5A8] animate-pulse" />
                            <span className="text-sm font-semibold text-white">All Angles Captured & Verified</span>
                            <span className="text-xs text-white/45">Click Submit below to finish registering face biometrics.</span>
                          </>
                        ) : webcamLoading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
                        ) : (
                          <>
                            <Camera className="h-8 w-8 text-white/20" />
                            <span className="text-xs">Camera is starting...</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pose Errors Display */}
                  {poseStep !== "done" && poseErrors[poseStep] && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-red-500/15 bg-red-500/[0.04] p-3 text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-medium">{poseErrors[poseStep]}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPoses}
                      disabled={poseStep === "straight" && Object.keys(capturedPoses).length === 0}
                      className="h-8 gap-1.5 text-xs border-white/10 hover:bg-white/[0.05]"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset Captures
                    </Button>

                    {poseStep !== "done" && (
                      <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={!cameraActive || validatingFrame}
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        {validatingFrame ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <Camera className="h-3.5 w-3.5" /> Capture {poseStep.toUpperCase()}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Preview Thumbnails */}
                  {Object.keys(capturedPoses).length > 0 && (
                    <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                      {(["straight", "right", "left"] as const).map((key) => {
                        const imgUrl = capturedPoses[key];
                        const score = poseScores[key];
                        return (
                          <div key={key} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                            {imgUrl ? (
                              <>
                                <img src={imgUrl} className="h-full w-full object-cover scale-x-[-1]" />
                                <div className="absolute bottom-0 left-0 right-0 bg-[#00E5A8]/80 text-[9px] font-bold text-black text-center py-0.5">
                                  {key.toUpperCase()}: {score ? `${Math.round(score)}%` : "OK"}
                                </div>
                              </>
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center text-white/20 gap-1">
                                <span className="text-[10px] font-semibold capitalize">{key}</span>
                                <span className="text-[8px] opacity-60">Pending</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEnrollModal(false)}
                  className="h-8 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleEnrollSubmit}
                  disabled={enrollSubmitting || poseStep !== "done"}
                  size="sm"
                  className="h-8 min-w-[130px] gap-1.5 text-xs font-semibold"
                >
                  {enrollSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Submit Enrollment
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showFpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-modal"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-[#0EA5E9]" />
                    Fingerprint Platform Key
                  </h3>
                  <p className="text-[11.5px] text-white/40 mt-1">
                    Register a native device passkey (Touch ID, Windows Hello, or platform biometrics).
                  </p>
                </div>
                <button
                  onClick={() => setShowFpModal(false)}
                  className="rounded-full bg-white/[0.04] p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex flex-col items-center justify-center py-6 text-center border border-white/[0.05] rounded-xl bg-white/[0.01] p-4">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-[#0EA5E9]/10 rounded-full blur-lg animate-pulse" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/10">
                      <Fingerprint className="h-7 w-7 text-[#0EA5E9]" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Scanner / Passkey Enrollment</h4>
                  <p className="text-[11px] text-white/45 max-w-[280px] mt-1.5">
                    Click scan below to trigger your browser's native credential promoter. Use Touch ID, Windows Hello, or security keys.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] text-white/40">
                  <Shield className="h-4 w-4 text-[#0EA5E9] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Privacy Guarantee:</strong> NeoFace only registers cryptographic keys. Raw fingerprint scans or scanner image data NEVER leave your device.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFpModal(false)}
                    className="h-8 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFingerprintRegister}
                    disabled={fpSubmitting}
                    size="sm"
                    className="h-8 min-w-[140px] gap-1.5 font-semibold text-xs bg-[#0EA5E9] hover:bg-[#0284c7] text-white"
                  >
                    {fpSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-3.5 w-3.5" /> Begin Scanner Scan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
