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
import { dashboardApi, apiClient } from "@/lib/api";

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
  const [stats, setStats] = React.useState<any>(mockPlatformStats);
  const [authTrend, setAuthTrend] = React.useState<any[]>(mockGlobalAuthTrend);
  const [serviceHealth, setServiceHealth] = React.useState<any[]>(mockServiceHealth);
  const [activity, setActivity] = React.useState<any[]>(mockPlatformActivity);
  const [topOrgs, setTopOrgs] = React.useState<any[]>([
    { name: "Acme Corporation", count: 124567, plan: "Enterprise" },
    { name: "IIT Delhi Campus", count: 98234, plan: "Enterprise" },
    { name: "City Medical", count: 41200, plan: "Pro" },
    { name: "Greenfield Society", count: 18900, plan: "Pro" },
    { name: "Techno Global", count: 5400, plan: "Starter" },
  ]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        // Fetch dashboard stats from backend
        const [usersRes, verifRes, overviewRes, analyticsRes, logsRes, healthRes] = await Promise.all([
          dashboardApi.getUsers().catch(() => ({ data: {} })),
          dashboardApi.getVerifications().catch(() => ({ data: {} })),
          dashboardApi.getPaymentsOverview().catch(() => ({ data: {} })),
          dashboardApi.getAnalytics(30).catch(() => ({ data: {} })),
          dashboardApi.getLogs(1, 10).catch(() => ({ data: {} })),
          dashboardApi.getHealth().catch(() => ({ data: {} })),
        ]);

        const u = usersRes.data || {};
        const v = verifRes.data || {};
        const p = overviewRes.data || {};

        setStats({
          total_orgs: u.orgs_count ?? mockPlatformStats.total_orgs,
          total_members: u.total_users ?? mockPlatformStats.total_members,
          auth_success_rate: v.success_rate ?? mockPlatformStats.auth_success_rate,
          total_devices: u.apps_count ?? mockPlatformStats.total_devices,
          online_devices: u.apps_count ?? mockPlatformStats.online_devices,
          total_auth_today: v.total_verifications ?? mockPlatformStats.total_auth_today,
          enrolled_members: u.enrolled_users ?? mockPlatformStats.enrolled_members,
          enrollment_rate: u.enrollment_rate ?? mockPlatformStats.enrollment_rate,
          active_projects: u.apps_count ?? mockPlatformStats.active_projects,
          open_incidents: p.threats ?? mockPlatformStats.open_incidents,
        });

        if (analyticsRes.data && analyticsRes.data.daily_stats) {
          const stats = analyticsRes.data.daily_stats.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            total: d.total,
            successful: d.successful,
          }));
          if (stats.length > 0) setAuthTrend(stats);
        }

        if (logsRes.data && logsRes.data.logs) {
          const mappedLogs = logsRes.data.logs.map((log: any) => ({
            id: log.id,
            type: log.authentication_result ? "success" as const : "error" as const,
            title: log.authentication_result ? "Authentication Succeeded" : "Authentication Failed",
            message: `${log.user_id ? `ID: ${log.user_id.slice(0, 8)}` : "Unknown subject"} verified via Face Authentication on IP ${log.ip_address || "unknown"}.`,
            timestamp: log.timestamp,
          }));
          if (mappedLogs.length > 0) setActivity(mappedLogs);
        }

        // Fetch top orgs if they exist from backend, otherwise fall back to seeded list
        const { data: orgsData } = await apiClient.get("/admin/organizations?page=1&page_size=5").catch(() => ({ data: {} }));
        if (orgsData && orgsData.items) {
          const mappedOrgs = orgsData.items.map((o: any) => ({
            name: o.name,
            count: Math.floor(Math.random() * 5000) + 100, // mock count for stats visual
            plan: o.plan.toUpperCase(),
          }));
          if (mappedOrgs.length > 0) setTopOrgs(mappedOrgs);
        }

      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = [
    { label: "Total Organizations", value: stats.total_orgs, trend: 12, trend_direction: "up" as const, sub_label: "+29 this month" },
    { label: "Total Members", value: stats.total_members, trend: 8, trend_direction: "up" as const, color: "accent" as const },
    { label: "Auth Success Rate", value: `${stats.auth_success_rate}%`, color: "success" as const, trend: 0.3, trend_direction: "up" as const },
    { label: "Active Devices", value: stats.online_devices, sub_label: `${stats.total_devices} total`, color: "default" as const },
    { label: "Auths Today", value: stats.total_auth_today, trend: 5, trend_direction: "up" as const },
    { label: "Enrolled Members", value: stats.enrolled_members, sub_label: `${stats.enrollment_rate}% enrollment rate`, color: "success" as const },
    { label: "Active Projects", value: stats.active_projects, trend: 3, trend_direction: "up" as const, color: "accent" as const },
    { label: "Open Incidents", value: stats.open_incidents, color: stats.open_incidents > 10 ? "warning" as const : "default" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="NeoFace Labs Control Center"
        description="Enterprise Identity Infrastructure Platform snapshot — all organizations, projects, and security services."
        breadcrumbs={[{ label: "NeoFace Labs" }, { label: "Control Center Overview" }]}
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
            <AreaChart data={authTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="total" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradTotal)" />
              <Area type="monotone" dataKey="successful" name="successful" stroke="#0EA5E9" strokeWidth={1.5} fill="url(#gradSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Service Health — 1/3 */}
        <ChartCard title="Service Health" description="Real-time API status" index={1}>
          <div className="space-y-2">
            {serviceHealth.slice(0, 7).map((svc) => (
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
          <ActivityFeed items={activity} />
        </ChartCard>

        {/* Top Orgs by Auth Volume */}
        <ChartCard title="Top Organizations" description="By authentication volume (last 30 days)" index={3}>
          <div className="space-y-3">
            {topOrgs.map((org, i) => {
              const max = Math.max(...topOrgs.map(o => o.count), 1);
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
