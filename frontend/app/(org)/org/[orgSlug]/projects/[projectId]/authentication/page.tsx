"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAuthLogs } from "@/lib/mock-data/education";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, Download, Activity, CheckCircle2, XCircle, AlertTriangle, Fingerprint, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard as CC } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockPeakHours } from "@/lib/mock-data/education";

const methodIcons = {
  face: Camera,
  fingerprint: Fingerprint,
  hybrid: Activity,
  "face+fingerprint": Activity,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/[0.09] bg-[#0a0a0a] px-3 py-2 shadow-modal">
      <p className="mb-1 text-[10.5px] text-white/40">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="text-[11px] text-white/60 capitalize">{p.name}:</span>
          <span className="text-[11px] font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AuthenticationPage({ params }: { params: Promise<{ orgSlug: string; projectId: string }> }) {
  const { orgSlug, projectId } = React.use(params);
  const [search, setSearch] = React.useState("");

  const filtered = mockAuthLogs.filter((log) =>
    search
      ? (log.member_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (log.device_name ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const stats = {
    total: mockAuthLogs.length,
    success: mockAuthLogs.filter((l) => l.result === "success").length,
    failed: mockAuthLogs.filter((l) => l.result === "failed").length,
    spoof: mockAuthLogs.filter((l) => l.result === "spoof_detected").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authentication"
        description="Real-time authentication logs, biometric results, and security events."
        breadcrumbs={[
          { label: "IIT Delhi Campus", href: `/org/${orgSlug}/projects/${projectId}` },
          { label: "Authentication" },
        ]}
        actions={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
            <Download className="h-3.5 w-3.5" />
            Export Logs
          </Button>
        }
      />

      {/* Summary KPIs */}
      <KPIGrid columns={4}>
        <KPICard label="Total Today" value={23456} index={0} />
        <KPICard label="Successful" value={22923} color="success" index={1} trend={97.8} />
        <KPICard label="Failed" value={509} color="warning" index={2} />
        <KPICard label="Spoof Attempts" value={24} color="error" index={3} />
      </KPIGrid>

      {/* Auth volume chart */}
      <ChartCard title="Auth Volume by Hour" description="Today's authentication activity" index={0}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockPeakHours.slice(5, 20)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9.5, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="auths" fill="#00E5A8" radius={[4, 4, 0, 0]} fillOpacity={0.65} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Auth logs table */}
      <ChartCard title="Authentication Logs" description="Live authentication events" index={1} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member or device..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
              <TableHead className="text-right">Liveness</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log, i) => {
              const MethodIcon = methodIcons[log.method] ?? Activity;
              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    {log.member_name ? (
                      <div>
                        <p className="text-[12px] font-medium text-white/80">{log.member_name}</p>
                        <p className="text-[10px] capitalize text-white/30">{log.member_type}</p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-white/25">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MethodIcon className="h-3.5 w-3.5 text-white/35" />
                      <span className="text-[11.5px] capitalize text-white/50">{log.method}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant="auth" status={log.result} />
                  </TableCell>
                  <TableCell className="text-right">
                    {log.confidence_score ? (
                      <span className={`text-[12px] font-semibold ${log.confidence_score >= 90 ? "text-[#00E5A8]" : log.confidence_score >= 70 ? "text-[#fbbf24]" : "text-[#f87171]"}`}>
                        {log.confidence_score.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {log.liveness_score ? (
                      <span className={`text-[12px] font-semibold ${log.liveness_score >= 80 ? "text-[#00E5A8]" : "text-[#f87171]"}`}>
                        {log.liveness_score.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-[11.5px] text-white/45">{log.device_name ?? "—"}</TableCell>
                  <TableCell className="text-[11px] text-white/35 capitalize">{log.zone?.replace(/_/g, " ") ?? "—"}</TableCell>
                  <TableCell className="text-[11px] text-white/30 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
