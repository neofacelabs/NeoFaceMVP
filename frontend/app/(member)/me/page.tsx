"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authApi, biometricsApi, dashboardApi } from "@/lib/api";

export default function MemberIdentityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [bioStatus, setBioStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    name: profile?.name || "Member User",
    email: profile?.email || "",
    role: profile?.role || "user",
    status: (profile?.is_active ? "active" : "suspended") as "active" | "suspended",
    created_at: profile?.created_at || new Date().toISOString(),
    phone: profile?.phone || "Not linked",
    face_status: (bioStatus?.face?.enrolled ? "enrolled" : "pending") as "enrolled" | "pending",
    face_count: bioStatus?.face?.embedding_count || 0,
    fingerprint_status: (bioStatus?.fingerprint?.enrolled ? "enrolled" : "pending") as "enrolled" | "pending",
    fingerprint_count: bioStatus?.fingerprint?.template_count || 0,
    enrolled_at: profile?.created_at || new Date().toISOString(),
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
              { label: "User ID", value: m.id.slice(0, 8) + "...", mono: true },
              { label: "Role", value: m.role.toUpperCase(), mono: true },
              { label: "Phone", value: m.phone },
              { label: "Enrolled", value: format(new Date(m.created_at), "MMM d, yyyy") },
            ].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-2">
                <span className="text-[11px] text-white/30">{row.label}</span>
                <span className={cn("text-right text-[11.5px] font-medium text-white/70", row.mono && "font-mono text-[10.5px]")}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
              <QrCode className="h-3.5 w-3.5" />
              Show QR
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
              <Download className="h-3.5 w-3.5" />
              Download ID
            </Button>
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
                        Enrolled {formatDistanceToNow(new Date(m.enrolled_at), { addSuffix: true })}
                      </div>
                    )}
                    {!bio.enrolled && (
                      <Button size="sm" className="mt-3 h-7 w-full gap-1.5 text-[11px]">
                        Enroll Now
                      </Button>
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
                        {formatDistanceToNow(new Date(auth.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
