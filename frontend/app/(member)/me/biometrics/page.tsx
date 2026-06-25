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
import { authApi, biometricsApi, dashboardApi, enrollmentApi } from "@/lib/api";
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

export default function MemberBiometricsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bioStatus, setBioStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Enrollment Modal States
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollTab, setEnrollTab] = useState<"camera" | "upload">("camera");
  const [capturedImages, setCapturedImages] = useState<{ url: string; score?: number; error?: string }[]>([]);
  const [uploadFiles, setUploadFiles] = useState<{ file: File; url: string; score?: number; error?: string }[]>([]);
  const [webcamLoading, setWebcamLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [validatingFrame, setValidatingFrame] = useState(false);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Webcam access failed:", err);
      toast.error("Could not access your webcam. Check permissions.");
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
    if (showEnrollModal && enrollTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showEnrollModal, enrollTab]);

  // Capture image and validate quality
  const handleCapture = async () => {
    if (!videoRef.current || validatingFrame) return;
    if (capturedImages.length >= 5) {
      toast.warning("You can capture up to 5 images.");
      return;
    }

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
      const file = dataURLtoFile(dataUrl, `frame_${Date.now()}.jpg`);
      const fd = new FormData();
      fd.append("file", file);

      const { data } = await enrollmentApi.validateFrame(fd);
      if (data.success) {
        setCapturedImages((prev) => [...prev, { url: dataUrl, score: data.quality_score }]);
        toast.success(`Face captured! Quality score: ${Math.round(data.quality_score)}%`);
      } else {
        setCapturedImages((prev) => [...prev, { url: dataUrl, error: data.error || "Quality check failed" }]);
        toast.error(data.error || "Quality check failed. Position face in circle.");
      }
    } catch (err) {
      console.error("Frame validation failed:", err);
      toast.error("Failed to perform frame quality check.");
    } finally {
      setValidatingFrame(false);
    }
  };

  // Handle file uploads and validate
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadFiles.length + files.length > 5) {
      toast.warning("You can upload up to 5 images.");
      return;
    }

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const fd = new FormData();
        fd.append("file", file);

        const { data } = await enrollmentApi.validateFrame(fd);
        if (data.success) {
          setUploadFiles((prev) => [...prev, { file, url, score: data.quality_score }]);
        } else {
          setUploadFiles((prev) => [...prev, { file, url, error: data.error || "Quality check failed" }]);
          toast.error(`${file.name}: ${data.error || "Quality check failed"}`);
        }
      } catch (err) {
        console.error(file.name, err);
      }
    }
  };

  // Submit enrollment
  const handleEnrollSubmit = async () => {
    const items = enrollTab === "camera" ? capturedImages : uploadFiles;
    const validItems = items.filter((x) => !x.error);

    if (validItems.length < 1) {
      toast.error("At least 1 valid face image with a passing quality check is required.");
      return;
    }

    try {
      setEnrollSubmitting(true);
      const fd = new FormData();
      fd.append("name", profile?.name || "Member User");
      fd.append("email", profile?.email || "");
      if (profile?.phone) fd.append("phone", profile.phone);

      if (enrollTab === "camera") {
        validItems.forEach((img, idx) => {
          const file = dataURLtoFile(img.url, `frame_${idx + 1}.jpg`);
          fd.append("images", file);
        });
      } else {
        (validItems as typeof uploadFiles).forEach((item) => {
          fd.append("images", item.file);
        });
      }

      await enrollmentApi.enroll(fd);
      toast.success("Face biometrics enrolled successfully! 🎉");
      setShowEnrollModal(false);
      setCapturedImages([]);
      setUploadFiles([]);
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteFingerprint}
            disabled={!fpEnrolled || actionLoading}
            className={cn(
              "mt-4 h-7 w-full gap-1.5 text-[11px]",
              fpEnrolled
                ? "border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                : "border-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            <AlertTriangle className="h-3 w-3" />
            Delete Fingerprint Template
          </Button>
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
                    Provide 1 to 5 face photographs to generate your encrypted authentication keys.
                  </p>
                </div>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="rounded-full bg-white/[0.04] p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex gap-2 border-b border-white/[0.06] pb-2">
                <button
                  type="button"
                  onClick={() => setEnrollTab("camera")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    enrollTab === "camera"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Live Camera Capture
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollTab("upload")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    enrollTab === "upload"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Image File Upload
                </button>
              </div>

              {/* Body */}
              <div className="mt-4 min-h-[250px]">
                {enrollTab === "camera" && (
                  <div className="space-y-4">
                    {/* Camera view */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                      {cameraActive ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover scale-x-[-1]"
                          />
                          {/* Face alignment overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-[180px] w-[180px] rounded-full border-2 border-dashed border-[#00E5A8]/50 bg-black/10 backdrop-contrast-125" />
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-white/30 gap-2">
                          {webcamLoading ? (
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

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/30">
                        Captured: {capturedImages.filter(x => !x.error).length} / 5 valid photos
                      </span>
                      <Button
                        type="button"
                        onClick={handleCapture}
                        disabled={!cameraActive || validatingFrame || capturedImages.length >= 5}
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        {validatingFrame ? (
                          <>
                            <Loader2 className="h-3 animate-spin" /> Checking Quality...
                          </>
                        ) : (
                          <>
                            <Camera className="h-3.5 w-3.5" /> Capture Frame
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Thumbnails */}
                    {capturedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.01] p-2.5">
                        {capturedImages.map((img, idx) => (
                          <div key={idx} className="relative h-12 w-16 overflow-hidden rounded-md border border-white/[0.08]">
                            <img src={img.url} className="h-full w-full object-cover scale-x-[-1]" />
                            {img.error ? (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center" title={img.error}>
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                              </div>
                            ) : (
                              <div className="absolute bottom-0 left-0 right-0 bg-[#00E5A8]/80 text-[8px] font-bold text-black text-center py-0.5">
                                {img.score ? `${Math.round(img.score)}%` : "OK"}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white/70 hover:bg-black hover:text-white"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {enrollTab === "upload" && (
                  <div className="space-y-4">
                    {/* Drag drop area */}
                    <label className="flex h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] p-4 text-center hover:bg-white/[0.03] transition-all">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="h-7 w-7 text-white/20 mb-2" />
                      <span className="text-xs font-semibold text-white/70">Click or Drag Portrait Images</span>
                      <span className="text-[10px] text-white/30 mt-1">Accepts PNG, JPG, or WebP. Max 5 files.</span>
                    </label>

                    {/* Files list */}
                    {uploadFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.01] p-2.5">
                        {uploadFiles.map((item, idx) => (
                          <div key={idx} className="relative h-12 w-16 overflow-hidden rounded-md border border-white/[0.08]">
                            <img src={item.url} className="h-full w-full object-cover" />
                            {item.error ? (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center" title={item.error}>
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                              </div>
                            ) : (
                              <div className="absolute bottom-0 left-0 right-0 bg-[#00E5A8]/80 text-[8px] font-bold text-black text-center py-0.5">
                                {item.score ? `${Math.round(item.score)}%` : "OK"}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white/70 hover:bg-black hover:text-white"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                  disabled={
                    enrollSubmitting ||
                    (enrollTab === "camera"
                      ? capturedImages.filter((x) => !x.error).length < 1
                      : uploadFiles.filter((x) => !x.error).length < 1)
                  }
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
      </AnimatePresence>
    </div>
  );
}
