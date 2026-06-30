"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Fingerprint,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  User,
  Bell,
  Lock,
  QrCode,
  Download,
  RotateCcw,
  Loader2,
  Copy,
  Printer,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authApi, biometricsApi, dashboardApi } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function safeFormatDate(dateVal: any): string {
  if (!dateVal) return "N/A";
  
  // If it's a Firestore Timestamp object
  let parsedVal = dateVal;
  if (dateVal && typeof dateVal === "object") {
    if (typeof dateVal.seconds === "number") {
      parsedVal = dateVal.seconds * 1000;
    } else if (typeof dateVal._seconds === "number") {
      parsedVal = dateVal._seconds * 1000;
    }
  }

  try {
    const d = new Date(parsedVal);
    if (isNaN(d.getTime())) {
      return "N/A";
    }
    return format(d, "MMM d, yyyy");
  } catch (err) {
    return "N/A";
  }
}

function safeFormatDistanceToNow(dateVal: any): string {
  if (!dateVal) return "recently";
  
  // If it's a Firestore Timestamp object
  let parsedVal = dateVal;
  if (dateVal && typeof dateVal === "object") {
    if (typeof dateVal.seconds === "number") {
      parsedVal = dateVal.seconds * 1000;
    } else if (typeof dateVal._seconds === "number") {
      parsedVal = dateVal._seconds * 1000;
    }
  }

  try {
    const d = new Date(parsedVal);
    if (isNaN(d.getTime())) {
      return "recently";
    }
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (err) {
    return "recently";
  }
}

export default function MemberIdentityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bioStatus, setBioStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, bioRes, logsRes] = await Promise.all([
          axios.get("/api/member/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
          }).catch((err) => {
            console.warn("Failed to fetch local member profile, falling back to backend me():", err);
            return authApi.me();
          }),
          biometricsApi.getStatus(),
          dashboardApi.getLogs(1, 100).catch(() => ({ data: { logs: [] } })),
        ]);
        setProfile(meRes.data);
        setBioStatus(bioRes.data);
        const allLogs = logsRes.data?.logs || [];
        const userLogs = allLogs.filter((l: any) => l.user_id === meRes.data.id).slice(0, 5);
        setLogs(userLogs);
      } catch (err) {
        console.error("Failed to load member profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const m = {
    id: profile?.id || "",
    neoId: profile?.neoId || "NEO-PEND-INGX-1234",
    qrCode: profile?.qrCode || "",
    verificationLevel: profile?.verificationLevel || "VERIFIED",
    name: profile?.name || "Member User",
    email: profile?.email || "",
    role: profile?.role || "user",
    status: (profile?.status?.toLowerCase() === "suspended" || profile?.is_active === false ? "suspended" : "active") as "active" | "suspended",
    created_at: profile?.createdAt || profile?.created_at || new Date().toISOString(),
    phone: profile?.phone || "Not linked",
    face_status: (bioStatus?.face?.enrolled ? "enrolled" : "pending") as "enrolled" | "pending",
    face_count: bioStatus?.face?.embedding_count || 0,
    fingerprint_status: (bioStatus?.fingerprint?.enrolled ? "enrolled" : "pending") as "enrolled" | "pending",
    fingerprint_count: bioStatus?.fingerprint?.template_count || 0,
    enrolled_at: profile?.createdAt || profile?.created_at || new Date().toISOString(),
  };

  const recentAuthsMapped = logs.map((log: any) => ({
    id: log.id,
    result: (log.authentication_result ? "success" : "failed") as "success" | "failed",
    method: log.confidence_score ? "face" : "fingerprint",
    zone: log.ip_address || "Web Portal",
    timestamp: log.timestamp,
    confidence: log.confidence_score ? log.confidence_score * 100 : undefined,
    liveness: log.liveness_score ? log.liveness_score * 100 : undefined,
  }));

  const handlePrintQR = () => {
    if (!m.qrCode) return;
    const win = window.open();
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${m.name}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, sans-serif; background-color: white; color: black; }
              img { max-width: 300px; height: auto; border: 1px solid #ccc; padding: 10px; border-radius: 8px; }
              h2 { margin-bottom: 5px; }
              p { font-family: monospace; font-size: 16px; margin-top: 5px; color: #555; }
            </style>
          </head>
          <body>
            <h2>${m.name}</h2>
            <img src="${m.qrCode}" />
            <p>${m.neoId}</p>
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 350);
    }
  };

  const handleDownloadID = async (format: "pdf" | "svg") => {
    try {
      setDownloadingFormat(format);
      const token = localStorage.getItem("bioid_access_token");
      const res = await fetch(`/api/member/download-id?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Server error");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neoface_id_${m.neoId.toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`ID Card downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("ID download failed:", err);
      toast.error("Failed to download ID Card");
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Identity"
        description="Your biometric identity card and enrollment status."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Identity card - large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[16px] border border-[#00E5A8]/15 bg-gradient-to-br from-[#00E5A8]/[0.06] via-black/50 to-[#0EA5E9]/[0.04] p-6 lg:col-span-1"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#00E5A8]/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5A8]/20 to-transparent" />

          {/* Avatar */}
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5A8]/30 to-[#0EA5E9]/20 text-3xl font-bold text-[#00E5A8]">
                {m.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#030303] bg-[#00E5A8]">
                <CheckCircle2 className="h-3.5 w-3.5 text-black" />
              </div>
            </div>
          </div>

          <div className="mb-5 text-center">
            <h2 className="text-lg font-bold text-white">{m.name}</h2>
            <p className="text-[11.5px] text-white/40">{m.email}</p>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <StatusBadge variant="member" status={m.status} />
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            {[
              { label: "NeoID", value: m.neoId, mono: true, copyable: true },
              { label: "Role", value: m.role.toUpperCase(), mono: true },
              { label: "Phone", value: m.phone },
              { label: "Enrolled", value: safeFormatDate(m.created_at) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/30">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-right text-[11.5px] font-medium text-white/70", row.mono && "font-mono text-[10.5px]")}>
                    {row.value}
                  </span>
                  {row.copyable && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(row.value);
                        toast.success("NeoID copied to clipboard");
                      }}
                      className="text-white/35 hover:text-[#00E5A8] transition-colors p-0.5 rounded"
                      title="Copy NeoID"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrModalOpen(true)}
              className="h-8 gap-1.5 text-[11px] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]"
            >
              <QrCode className="h-3.5 w-3.5" />
              Show QR
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!downloadingFormat}
                  className="h-8 gap-1.5 text-[11px] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05] cursor-pointer"
                >
                  {downloadingFormat ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download ID
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0B0B0B]/95 border-white/10 backdrop-blur-xl text-white/80">
                <DropdownMenuItem
                  onClick={() => handleDownloadID("pdf")}
                  className="gap-2 cursor-pointer hover:bg-white/[0.05] hover:text-[#00E5A8]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download PDF Card</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownloadID("svg")}
                  className="gap-2 cursor-pointer hover:bg-white/[0.05] hover:text-[#00E5A8]"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Download SVG Vector</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Right: Biometrics + Activity */}
        <div className="space-y-5 lg:col-span-2">
          {/* Biometrics status */}
          <ChartCard title="Biometric Enrollment" description="Your registered biometric templates" index={0}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Face Recognition",
                  status: m.face_status,
                  icon: Camera,
                  description: `ArcFace v1.0 · ${m.face_count} template(s) enrolled`,
                  enrolled: m.face_status === "enrolled",
                },
                {
                  label: "Fingerprint",
                  status: m.fingerprint_status,
                  icon: Fingerprint,
                  description: `ISO 19794-2 · ${m.fingerprint_count} template(s) enrolled`,
                  enrolled: m.fingerprint_status === "enrolled",
                },
              ].map((bio) => {
                const Icon = bio.icon;
                return (
                  <div
                    key={bio.label}
                    className={cn(
                      "rounded-[12px] border p-4",
                      bio.enrolled
                        ? "border-[#00E5A8]/15 bg-[#00E5A8]/[0.04]"
                        : "border-white/[0.065] bg-white/[0.025]"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", bio.enrolled ? "bg-[#00E5A8]/10 border-[#00E5A8]/20" : "bg-white/[0.04] border-white/[0.08]")}>
                          <Icon className={cn("h-4 w-4", bio.enrolled ? "text-[#00E5A8]" : "text-white/30")} />
                        </div>
                        <span className="text-[12.5px] font-semibold text-white/85">{bio.label}</span>
                      </div>
                      <StatusBadge variant="biometric" status={bio.status} />
                    </div>
                    <p className="text-[11px] text-white/35">{bio.description}</p>
                    {bio.enrolled && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10.5px] text-[#00E5A8]/60">
                        <CheckCircle2 className="h-3 w-3" />
                        Enrolled {safeFormatDistanceToNow(m.enrolled_at)}
                      </div>
                    )}
                    {!bio.enrolled && (
                      <Link href="/me/biometrics" className="mt-3 block w-full">
                        <Button size="sm" className="h-7 w-full gap-1.5 text-[11px]">
                          Enroll Now
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Recent auth events */}
          <ChartCard title="Recent Authentication" description="Your last 5 authentication events" index={1}>
            <div className="space-y-0">
              {recentAuthsMapped.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-white/30">
                  No recent authentication logs found.
                </div>
              ) : (
                recentAuthsMapped.map((auth, i) => (
                  <motion.div
                    key={auth.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 border-b border-white/[0.04] py-3 last:border-0"
                  >
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-md shrink-0", auth.result === "success" ? "bg-[#00E5A8]/8" : "bg-[#f87171]/8")}>
                      {auth.result === "success" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00E5A8]" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-[#f87171]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-white/80 capitalize">{auth.method}</span>
                        <span className="text-[10px] text-white/25">·</span>
                        <div className="flex items-center gap-1 text-[11px] text-white/40">
                          <MapPin className="h-3 w-3" />
                          {auth.zone}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {auth.confidence && (
                          <span className="text-[10.5px] text-white/30">Match: <span className={auth.confidence > 90 ? "text-[#00E5A8]/60" : "text-[#f87171]/60"}>{auth.confidence.toFixed(1)}%</span></span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge variant="auth" status={auth.result} />
                      <p className="mt-0.5 text-[10px] text-white/20">
                        {safeFormatDistanceToNow(auth.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* QR Code Modal - Premium Dark Glassmorphism Design */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#070707]/80 p-6 shadow-2xl backdrop-blur-2xl max-w-sm w-full mx-auto"
            >
              {/* Top luxury green radial glow */}
              <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#00E5A8]/[0.08] blur-3xl" />

              {/* Close Button */}
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-white/30 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Close Modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* Header Info */}
              <div className="flex flex-col items-center mb-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 text-[#00E5A8] mb-3 shadow-[0_0_20px_rgba(0,229,168,0.1)]">
                  <CheckCircle2 className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight leading-none mb-1.5">{m.name}</h3>
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#00E5A8] bg-[#00E5A8]/8 border border-[#00E5A8]/20 px-2.5 py-0.5 rounded-full">
                    {m.verificationLevel}
                  </span>
                </div>
              </div>

              {/* Large QR Display */}
              <div className="flex justify-center mb-6">
                <div className="relative rounded-2xl border border-white/5 bg-white/[0.015] p-4 shadow-2xl">
                  {m.qrCode ? (
                    <img
                      src={m.qrCode}
                      alt="NeoID QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg bg-white p-1 shadow-md"
                    />
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center text-white/40">
                      <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Identity Display & Copy */}
              <div className="text-center mb-6">
                <p className="text-[9px] text-white/30 font-bold tracking-widest mb-1.5">PERMANENT DIGITAL IDENTITY</p>
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] px-3.5 py-2 font-mono text-sm font-semibold text-white/90 shadow-inner">
                  <span>{m.neoId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.neoId);
                      toast.success("NeoID copied");
                    }}
                    className="text-white/30 hover:text-[#00E5A8] transition-colors p-0.5"
                    title="Copy NeoID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!m.qrCode) return;
                    const link = document.createElement("a");
                    link.href = m.qrCode;
                    link.download = `neoid_qr_${m.neoId.toLowerCase()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("QR Code downloaded");
                  }}
                  className="h-8.5 gap-1.5 text-[11px] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintQR}
                  className="h-8.5 gap-1.5 text-[11px] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print QR
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
