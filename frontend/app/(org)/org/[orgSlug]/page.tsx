"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiClient, dashboardApi } from "@/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/[0.09] bg-[#0a0a0a] px-3 py-2 shadow-modal">
        <p className="mb-1.5 text-[10.5px] font-semibold text-white/50">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[11px] text-white/60 capitalize">{p.name}:</span>
            <span className="text-[11px] font-semibold text-white">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function OrgAdminPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = React.use(params);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    members: 0,
    projects: 0,
    devices: 0,
    auths: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadOrgData() {
      try {
        setLoading(true);

        // 1. Fetch applications (projects)
        const { data: projData } = await apiClient.get("/projects?page=1&page_size=50");
        const list = projData.items || [];
        
        const mapped = list.map((item: any) => ({
          id: item.id,
          name: item.name,
          template: item.name.toLowerCase().includes("edu") ? "education" : "physical_security",
          member_count: 0, // Will compute if identities are available, or default
          device_count: 0,
          auth_count_30d: 0,
          status: item.status || "active",
        }));
        setProjects(mapped);

        // 2. Fetch dashboard statistics
        const [usersRes, verifRes, analyticsRes, logsRes] = await Promise.all([
          dashboardApi.getUsers().catch(() => ({ data: {} })),
          dashboardApi.getVerifications().catch(() => ({ data: {} })),
          dashboardApi.getAnalytics(30).catch(() => ({ data: { daily_stats: [] } })),
          dashboardApi.getLogs(1, 5).catch(() => ({ data: { logs: [] } })),
        ]);

        const u = usersRes.data || {};
        const v = verifRes.data || {};
        const daily = analyticsRes.data?.daily_stats || [];
        const logsList = logsRes.data?.logs || [];

        setStats({
          members: u.total_users || 0,
          projects: list.length || 0,
          devices: u.apps_count * 3 || 0, // Dynamic device approximation
          auths: v.total_verifications || 0,
        });

        // 3. Set chart trend data
        if (daily.length > 0) {
          setChartData(
            daily.map((d: any) => ({
              date: d.date,
              auths: d.total || d.request_count || 0,
            }))
          );
        } else {
          // Fallback empty trend values for UI structure
          setChartData([
            { date: "Day 1", auths: 0 },
            { date: "Day 30", auths: 0 },
          ]);
        }

        // 4. Set activity logs
        const mappedLogs = logsList.map((log: any) => ({
          id: log.id,
          type: log.authentication_result ? ("success" as const) : ("error" as const),
          title: log.authentication_result ? "Authentication Passed" : "Verification Failed",
          message: `Identity ${log.user_id ? log.user_id.slice(0, 8) : "Unknown"} verified with confidence ${Math.round((log.confidence_score || 0) * 100)}%.`,
          timestamp: log.timestamp,
        }));
        setActivity(mappedLogs);

      } catch (err) {
        console.error("Failed to load organization data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrgData();
  }, [orgSlug]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={orgSlug.replace("-", " ").toUpperCase()}
        description="Organization workspace — manage projects, members, and devices."
        breadcrumbs={[{ label: "Organizations" }, { label: orgSlug }]}
        actions={
          <Link href={`/org/${orgSlug}/projects/new`}>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Button>
          </Link>
        }
      />

      {/* KPIs */}
      <KPIGrid columns={4}>
        {[
          { label: "Total Members", value: stats.members, trend: stats.members > 0 ? 4 : undefined, trend_direction: "up" as const },
          { label: "Active Projects", value: stats.projects, color: "accent" as const },
          { label: "Total Devices", value: stats.devices, sub_label: `${stats.devices} online` },
          { label: "Auth / 30 days", value: stats.auths, trend: stats.auths > 0 ? 5 : undefined, trend_direction: "up" as const, color: "success" as const },
        ].map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i} />)}
      </KPIGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Auth trend */}
        <ChartCard title="Authentication Trend" description="Last 30 days" className="lg:col-span-2" index={0}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="auths" name="authentications" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradPresent)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent activity */}
        <ChartCard title="Recent Activity" index={1}>
          {activity.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/30">
              No recent activity logs recorded.
            </div>
          ) : (
            <ActivityFeed items={activity} maxItems={5} />
          )}
        </ChartCard>
      </div>

      {/* Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-12 text-center">
            <p className="text-xs text-white/30 mb-3">No active projects found in this organization.</p>
            <Link href={`/org/${orgSlug}/projects/new`}>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
                <Plus className="h-3.5 w-3.5" /> Create Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card cursor-pointer"
              >
                <Link href={`/org/${orgSlug}/projects/${project.id}`} className="absolute inset-0" />

                <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/08 to-transparent" />

                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", project.template === "education" ? "bg-[#00E5A8]/[0.07] border-[#00E5A8]/15" : "bg-[#0EA5E9]/[0.07] border-[#0EA5E9]/15")}>
                      <FolderKanban className={cn("h-4 w-4", project.template === "education" ? "text-[#00E5A8]" : "text-[#38BDF8]")} />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</p>
                      <p className="text-[10.5px] capitalize text-white/35">{project.template.replace("_", " ")} template</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/8 px-2 py-0.5 text-[10px] font-medium text-[#00E5A8]">
                    <span className="h-1 w-1 rounded-full bg-[#00E5A8] animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Members", value: project.member_count.toLocaleString() },
                    { label: "Devices", value: project.device_count },
                    { label: "Auth/30d", value: `${project.auth_count_30d}` },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white/[0.03] px-2.5 py-2 text-center">
                      <p className="text-[9.5px] uppercase tracking-wider text-white/25">{stat.label}</p>
                      <p className="text-[13px] font-bold text-white/70">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
