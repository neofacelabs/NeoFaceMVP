"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { mockPlatformStats, mockPlatformActivity, mockGlobalAuthTrend, mockServiceHealth } from "@/lib/mock-data/super-admin";
import { cn } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/[0.09] bg-[#0a0a0a] px-3 py-2 shadow-modal">
        <p className="mb-1.5 text-[10.5px] font-semibold text-white/50">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[11px] text-white/70 capitalize">{p.name}:</span>
            <span className="text-[11px] font-semibold text-white">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const statusIcon = (status: string) => {
  if (status === "operational") return <CheckCircle2 className="h-3.5 w-3.5 text-[#00E5A8]" />;
  if (status === "degraded") return <AlertCircle className="h-3.5 w-3.5 text-[#fbbf24]" />;
  return <MinusCircle className="h-3.5 w-3.5 text-[#f87171]" />;
};

export default function SuperAdminPage() {
  const s = mockPlatformStats;

  const kpis = [
    { label: "Total Organizations", value: s.total_orgs, trend: 12, trend_direction: "up" as const, sub_label: "+29 this month" },
    { label: "Total Members", value: s.total_members, trend: 8, trend_direction: "up" as const, color: "accent" as const },
    { label: "Auth Success Rate", value: `${s.auth_success_rate}%`, color: "success" as const, trend: 0.3, trend_direction: "up" as const },
    { label: "Active Devices", value: s.online_devices, sub_label: `${s.total_devices} total`, color: "default" as const },
    { label: "Auths Today", value: s.total_auth_today, trend: 5, trend_direction: "up" as const },
    { label: "Enrolled Members", value: s.enrolled_members, sub_label: `${s.enrollment_rate}% enrollment rate`, color: "success" as const },
    { label: "Active Projects", value: s.active_projects, trend: 3, trend_direction: "up" as const, color: "accent" as const },
    { label: "Open Incidents", value: s.open_incidents, color: s.open_incidents > 10 ? "warning" as const : "default" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Real-time view of NeoFace Cloud — all organizations, AI models, and infrastructure."
        breadcrumbs={[{ label: "NeoFace Super Admin" }, { label: "Overview" }]}
        actions={
          <span className="flex items-center gap-1.5 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/8 px-3 py-1 text-[10.5px] font-medium text-[#00E5A8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
            All Systems Operational
          </span>
        }
      />

      {/* KPIs — Row 1 */}
      <KPIGrid columns={4}>
        {kpis.slice(0, 4).map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i} />
        ))}
      </KPIGrid>

      {/* KPIs — Row 2 */}
      <KPIGrid columns={4}>
        {kpis.slice(4, 8).map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i + 4} />
        ))}
      </KPIGrid>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main auth trend chart — 2/3 width */}
        <ChartCard
          title="Global Authentication Trend"
          description="Last 30 days across all organizations"
          className="lg:col-span-2"
          index={0}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockGlobalAuthTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="total" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradTotal)" />
              <Area type="monotone" dataKey="successful" name="successful" stroke="#0EA5E9" strokeWidth={1.5} fill="url(#gradSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Service Health — 1/3 */}
        <ChartCard title="Service Health" description="Real-time API status" index={1}>
          <div className="space-y-2">
            {mockServiceHealth.slice(0, 7).map((svc) => (
              <div key={svc.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {statusIcon(svc.status)}
                  <span className="truncate text-[11.5px] text-white/60">{svc.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10.5px] text-white/30">{svc.latency_ms}ms</span>
                  <span className={cn("text-[10px] font-semibold", svc.status === "operational" ? "text-[#00E5A8]" : svc.status === "degraded" ? "text-[#fbbf24]" : "text-[#f87171]")}>
                    {svc.uptime_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Bottom row: Activity + Orgs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Platform Activity" description="Recent events across all organizations" index={2}>
          <ActivityFeed items={mockPlatformActivity} />
        </ChartCard>

        {/* Top Orgs by Auth Volume */}
        <ChartCard title="Top Organizations" description="By authentication volume (last 30 days)" index={3}>
          <div className="space-y-3">
            {[
              { name: "Acme Corporation", count: 124567, plan: "Enterprise" },
              { name: "IIT Delhi", count: 98234, plan: "Enterprise" },
              { name: "City Medical", count: 41200, plan: "Pro" },
              { name: "Greenfield Society", count: 18900, plan: "Pro" },
              { name: "Techno Global", count: 5400, plan: "Starter" },
            ].map((org, i) => {
              const max = 124567;
              const pct = (org.count / max) * 100;
              return (
                <div key={org.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/20 tabular-nums w-3">{i + 1}</span>
                      <span className="text-[12px] font-medium text-white/75">{org.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30">{org.plan}</span>
                      <span className="text-[11.5px] font-semibold text-white/60">{org.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-[#00E5A8] to-[#0EA5E9]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
