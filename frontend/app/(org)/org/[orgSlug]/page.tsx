"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { mockOrganizations } from "@/lib/mock-data/super-admin";
import { mockEducationActivity } from "@/lib/mock-data/education";
import { mockAttendanceTrend } from "@/lib/mock-data/education";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

const mockProjects = [
  { id: "edu-001", name: "IIT Delhi Campus", template: "education", member_count: 12450, device_count: 284, auth_count_30d: 98234, status: "active" },
  { id: "sec-001", name: "Delhi Campus Security", template: "physical_security", member_count: 450, device_count: 38, auth_count_30d: 12300, status: "active" },
];

export default function OrgAdminPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = React.use(params);
  const org = mockOrganizations.find((o) => o.slug === orgSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        title={org?.name ?? orgSlug}
        description="Organization workspace — manage projects, members, and devices."
        breadcrumbs={[{ label: "Organizations" }, { label: org?.name ?? orgSlug }]}
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
          { label: "Total Members", value: org?.member_count ?? 0, trend: 8, trend_direction: "up" as const },
          { label: "Active Projects", value: org?.project_count ?? 0, color: "accent" as const },
          { label: "Total Devices", value: org?.device_count ?? 0, sub_label: "284 online" },
          { label: "Auth / 30 days", value: org?.auth_count_30d ?? 0, trend: 5, trend_direction: "up" as const, color: "success" as const },
        ].map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i} />)}
      </KPIGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Auth trend */}
        <ChartCard title="Authentication Trend" description="Last 30 days" className="lg:col-span-2" index={0}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockAttendanceTrend.map(d => ({ ...d, auths: d.present }))} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" name="authentications" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradPresent)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent activity */}
        <ChartCard title="Recent Activity" index={1}>
          <ActivityFeed items={mockEducationActivity} maxItems={5} />
        </ChartCard>
      </div>

      {/* Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">Projects</h2>
          <Link href={`/org/${orgSlug}/projects`} className="flex items-center gap-1 text-[11.5px] text-white/30 hover:text-[#00E5A8] transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mockProjects.map((project, i) => (
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
                  { label: "Auth/30d", value: `${(project.auth_count_30d / 1000).toFixed(0)}K` },
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
      </div>
    </div>
  );
}
