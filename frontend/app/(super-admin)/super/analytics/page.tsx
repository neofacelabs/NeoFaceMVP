"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { mockGlobalAuthTrend } from "@/lib/mock-data/super-admin";
import { motion } from "framer-motion";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/[0.09] bg-[#0a0a0a] px-3 py-2 shadow-modal">
      <p className="mb-1.5 text-[10.5px] font-semibold text-white/50">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-[11px] text-white/60 capitalize">{p.name}:</span>
          <span className="text-[11px] font-semibold text-white">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const geoData = [
  { region: "AP South 1", auths: 420834, orgs: 148 },
  { region: "US East 1", auths: 184231, orgs: 72 },
  { region: "EU West 1", auths: 27826, orgs: 27 },
];

const templateData = [
  { name: "Education", value: 62, color: "#00E5A8" },
  { name: "Physical Security", value: 38, color: "#0EA5E9" },
];

const weeklyGrowth = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2024, i, 1).toLocaleString("default", { month: "short" }),
  orgs: 165 + Math.round(i * 7.5 + Math.random() * 5),
  members: 52000 + Math.round(i * 3000 + Math.random() * 1500),
}));

import { dashboardApi } from "@/lib/api";

export default function AnalyticsPage() {
  const [stats, setStats] = React.useState({
    volume: 632891,
    newOrgs: 29,
    newMembers: 8234,
    uptime: "99.96%",
  });
  const [authTrend, setAuthTrend] = React.useState<any[]>(mockGlobalAuthTrend);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadAnalytics() {
      try {
        const [usersRes, verifRes, analyticsRes] = await Promise.all([
          dashboardApi.getUsers().catch(() => ({ data: {} })),
          dashboardApi.getVerifications().catch(() => ({ data: {} })),
          dashboardApi.getAnalytics(30).catch(() => ({ data: {} })),
        ]);

        const u = usersRes.data || {};
        const v = verifRes.data || {};

        setStats({
          volume: v.total_verifications || 632891,
          newOrgs: u.orgs_count || 29,
          newMembers: u.total_users || 8234,
          uptime: "99.98%",
        });

        if (analyticsRes.data && analyticsRes.data.daily_stats) {
          const stats = analyticsRes.data.daily_stats.map((d: any) => ({
            date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            total: d.total,
            successful: d.successful,
          }));
          if (stats.length > 0) setAuthTrend(stats);
        }
      } catch (err) {
        console.error("Failed to load backend analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Platform-wide usage analytics, growth metrics, and regional breakdowns."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Analytics" }]}
      />

      <KPIGrid columns={4}>
        <KPICard label="Auth Volume (30d)" value={stats.volume} trend={18} trend_direction="up" index={0} color="success" />
        <KPICard label="New Organizations" value={stats.newOrgs} trend={12} trend_direction="up" index={1} color="accent" />
        <KPICard label="New Members" value={stats.newMembers} trend={8} trend_direction="up" index={2} />
        <KPICard label="Platform Uptime" value={stats.uptime} color="success" index={3} />
      </KPIGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Authentication Volume" description="Last 30 days — total vs successful" className="lg:col-span-2" index={0}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={authTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="total" stroke="#00E5A8" strokeWidth={1.5} fill="url(#g1)" />
              <Area type="monotone" dataKey="successful" name="successful" stroke="#0EA5E9" strokeWidth={1} fill="rgba(14,165,233,0.06)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Project Templates" description="Distribution across all projects" index={1}>
          <div className="flex flex-col items-center justify-center py-4">
            <PieChart width={160} height={160}>
              <Pie data={templateData} cx={75} cy={75} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {templateData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="mt-3 space-y-2 w-full">
              {templateData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-white/55">{d.name}</span>
                  </div>
                  <span className="font-semibold text-white/80">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Platform Growth" description="Organization and member count over 12 months" index={2}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="orgs" name="Organizations" fill="#00E5A8" radius={[3, 3, 0, 0]} fillOpacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regional Breakdown" description="Auth volume by deployment region" index={3}>
          <div className="space-y-4 py-2">
            {geoData.map((region, i) => {
              const max = geoData[0].auths;
              const pct = ((region.auths / max) * 100).toFixed(1);
              return (
                <div key={region.region} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/60">{region.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] text-white/30">{region.orgs} orgs</span>
                      <span className="font-semibold text-white/75">{region.auths.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.3 + i * 0.12 }}
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
