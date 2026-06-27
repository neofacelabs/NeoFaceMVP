"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/api/projects";
import { useSites } from "@/lib/api/sites";
import { useIdentities } from "@/lib/api/identities";
import { useDevices } from "@/lib/api/devices";
import { useAuthLogs, useAuthStats } from "@/lib/api/authentication";

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

  // Queries
  const { data: projectsData, isLoading: projLoading } = useProjects(1, 50);
  const { data: sitesData } = useSites();
  const { data: identitiesData } = useIdentities(1, 100);
  const { data: devicesData } = useDevices(1, 100);
  const { data: authLogsData } = useAuthLogs(1, 5);
  const { data: authStatsData } = useAuthStats(30);

  const projects = projectsData?.items || [];
  const sites = sitesData?.items || [];
  const identitiesCount = identitiesData?.total || 0;
  const devicesCount = devicesData?.total || 0;
  const recentLogs = authLogsData?.items || [];

  const stats = {
    members: identitiesCount,
    projects: projects.length,
    devices: devicesCount,
    auths: authStatsData?.total_authentications || 0,
  };

  // Build daily trend list for chart from stats
  const chartData = [
    { date: "Day 1", auths: Math.round(stats.auths * 0.1) },
    { date: "Day 5", auths: Math.round(stats.auths * 0.25) },
    { date: "Day 10", auths: Math.round(stats.auths * 0.4) },
    { date: "Day 15", auths: Math.round(stats.auths * 0.6) },
    { date: "Day 20", auths: Math.round(stats.auths * 0.8) },
    { date: "Day 30", auths: stats.auths }
  ];

  const activity = recentLogs.map((log: any) => ({
    id: log.id,
    type: log.success ? ("success" as const) : ("error" as const),
    title: log.success ? "Authentication Passed" : "Verification Failed",
    message: `Identity ${log.user_name} verified via ${log.method} with confidence ${Math.round((log.confidence || 0) * 100)}%.`,
    timestamp: log.timestamp,
  }));

  const isLoading = projLoading;

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
          { label: "Total Members", value: stats.members },
          { label: "Active Projects", value: stats.projects, color: "accent" as const },
          { label: "Total Devices", value: stats.devices, sub_label: `${stats.devices} online` },
          { label: "Auth / 30 days", value: stats.auths, color: "success" as const },
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={1} />
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
          <h2 className="text-sm font-semibold text-white/80">Active Projects</h2>
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
            {projects.map((project: any, i: number) => {
              const site = sites.find((s: any) => s.id === project.site_id);
              return (
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                        <FolderKanban className="h-4 w-4 text-[#00E5A8]" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</p>
                        <p className="text-[10.5px] capitalize text-white/35">{project.environment}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/8 px-2 py-0.5 text-[10px] font-medium text-[#00E5A8]">
                      <span className="h-1 w-1 rounded-full bg-[#00E5A8] animate-pulse" />
                      {project.status || "active"}
                    </span>
                  </div>

                  <p className="text-xs text-white/50 mb-3 min-h-[32px] line-clamp-2">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10.5px]">
                    <span className="text-white/30">
                      {site ? `Site: ${site.name}` : "Global Project"}
                    </span>
                    <span className="text-white/25">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
