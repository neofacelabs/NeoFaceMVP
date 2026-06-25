"use client";

import React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const mockMyAuths = [
  { id: "1", result: "success" as const, method: "face", zone: "Main Gate", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), confidence: 98.4, liveness: 99.1, device: "Gate Camera A1" },
  { id: "2", result: "success" as const, method: "face", zone: "Library Entrance", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), confidence: 97.8, liveness: 98.6, device: "Gate Camera L1" },
  { id: "3", result: "success" as const, method: "face", zone: "Lab 204", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), confidence: 99.1, liveness: 99.4, device: "Lab Terminal" },
  { id: "4", result: "success" as const, method: "fingerprint", zone: "Hostel A", timestamp: new Date(Date.now() - 22 * 3600000).toISOString(), confidence: 98.9, liveness: undefined, device: "Hostel Scanner H1" },
  { id: "5", result: "failed" as const, method: "face", zone: "Admin Block", timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), confidence: 62.1, liveness: 88.2, device: "Admin Camera A3" },
  { id: "6", result: "success" as const, method: "face", zone: "Cafeteria", timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), confidence: 96.3, liveness: 97.5, device: "Cafe Terminal" },
];

export default function MemberBiometricsPage() {
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
          className="relative overflow-hidden rounded-[14px] border border-[#00E5A8]/15 bg-[#00E5A8]/[0.04] p-5"
        >
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#00E5A8]/20 to-transparent" />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00E5A8]/20 bg-[#00E5A8]/10">
                <Camera className="h-4 w-4 text-[#00E5A8]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Face Recognition</p>
                <p className="text-[11px] text-white/35">FaceNet v3.2 · Primary</p>
              </div>
            </div>
            <StatusBadge variant="biometric" status="enrolled" />
          </div>
          <div className="space-y-2 text-[11.5px]">
            {[
              { label: "Templates", value: "1 face template" },
              { label: "Enrolled", value: "Jan 20, 2024" },
              { label: "Last used", value: "20 minutes ago" },
              { label: "Avg match score", value: "98.1%" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-white/30">{row.label}</span>
                <span className="font-medium text-white/70">{row.value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4 h-7 w-full gap-1.5 text-[11px] border-[#00E5A8]/15 text-[#00E5A8]/60 hover:text-[#00E5A8] hover:bg-[#00E5A8]/[0.08]">
            <RotateCcw className="h-3 w-3" />
            Update Face Template
          </Button>
        </motion.div>

        {/* Fingerprint */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[14px] border border-[#0EA5E9]/15 bg-[#0EA5E9]/[0.04] p-5"
        >
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/20 to-transparent" />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/10">
                <Fingerprint className="h-4 w-4 text-[#38BDF8]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Fingerprint</p>
                <p className="text-[11px] text-white/35">FingerprintNet v1.4 · 2 fingers</p>
              </div>
            </div>
            <StatusBadge variant="biometric" status="enrolled" />
          </div>
          <div className="space-y-2 text-[11.5px]">
            {[
              { label: "Templates", value: "Right thumb + Left index" },
              { label: "Enrolled", value: "Jan 20, 2024" },
              { label: "Last used", value: "22 hours ago" },
              { label: "Avg match score", value: "98.9%" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-white/30">{row.label}</span>
                <span className="font-medium text-white/70">{row.value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4 h-7 w-full gap-1.5 text-[11px] border-[#38BDF8]/15 text-[#38BDF8]/60 hover:text-[#38BDF8] hover:bg-[#38BDF8]/[0.08]">
            <RotateCcw className="h-3 w-3" />
            Update Fingerprint
          </Button>
        </motion.div>
      </div>

      {/* KPIs */}
      <KPIGrid columns={4}>
        <KPICard label="Total Authentications" value={mockMyAuths.filter(a => a.result === "success").length + mockMyAuths.filter(a => a.result === "failed").length} index={0} />
        <KPICard label="Success Rate" value="83.3%" color="success" index={1} />
        <KPICard label="This Week" value={mockMyAuths.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 86400000)).length} index={2} color="accent" />
        <KPICard label="Failed Attempts" value={mockMyAuths.filter(a => a.result === "failed").length} color="warning" index={3} />
      </KPIGrid>

      {/* Detailed auth history */}
      <ChartCard title="Authentication History" description="All your biometric authentication events" index={0}>
        <div className="space-y-0">
          {mockMyAuths.map((auth, i) => (
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
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
