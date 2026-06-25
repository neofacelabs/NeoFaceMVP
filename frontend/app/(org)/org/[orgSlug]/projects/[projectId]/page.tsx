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
import {
  mockEducationActivity,
  mockAttendanceTrend,
  mockPeakHours,
} from "@/lib/mock-data/education";
import { GraduationCap, Users, BookOpen, UserCheck, WifiOff, Clock, CheckCircle, XCircle } from "lucide-react";
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
            <span className="text-[11px] font-semibold text-white">{p.value?.toLocaleString?.() ?? p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EducationDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = React.use(params);
  const kpis = [
    { label: "Total Students", value: 10840, trend: 4, trend_direction: "up" as const },
    { label: "Total Faculty", value: 342, color: "accent" as const },
    { label: "Total Staff", value: 280 },
    { label: "Active Today", value: 8234, trend: 2, trend_direction: "up" as const, color: "success" as const },
    { label: "Today's Attendance", value: "82.4%", color: "success" as const, trend: 1.2, trend_direction: "up" as const },
    { label: "Auth Success %", value: "97.8%", color: "success" as const },
    { label: "Failed Attempts", value: 24, color: "warning" as const, trend: 12, trend_direction: "down" as const },
    { label: "Offline Devices", value: 2, color: "error" as const },
  ];

  // Enrollment completion data
  const enrollmentData = [
    { name: "Face Only", value: 320, fill: "#0EA5E9" },
    { name: "Both", value: 10840, fill: "#00E5A8" },
    { name: "Fingerprint Only", value: 180, fill: "#14B8A6" },
    { name: "Not Enrolled", value: 910, fill: "rgba(255,255,255,0.08)" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education Dashboard"
        description="Campus-wide attendance, authentication, and enrollment overview."
        breadcrumbs={[
          { label: "IIT Delhi", href: `/org/${orgSlug}` },
          { label: "Projects", href: `/org/${orgSlug}/projects` },
          { label: "IIT Delhi Campus" },
        ]}
        badge={
          <span className="flex items-center gap-1.5 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/8 px-2.5 py-0.5 text-[10.5px] font-medium text-[#00E5A8]">
            <GraduationCap className="h-3 w-3" />
            Education
          </span>
        }
      />

      {/* KPIs row 1 */}
      <KPIGrid columns={4}>
        {kpis.slice(0, 4).map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i} />)}
      </KPIGrid>

      {/* KPIs row 2 */}
      <KPIGrid columns={4}>
        {kpis.slice(4).map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i + 4} />)}
      </KPIGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Attendance trend */}
        <ChartCard
          title="Attendance Trend"
          description="Present / Absent / Late — last 30 days"
          className="lg:col-span-2"
          index={0}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockAttendanceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00E5A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" name="present" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradP)" />
              <Area type="monotone" dataKey="absent" name="absent" stroke="#f87171" strokeWidth={1} fill="rgba(248,113,113,0.05)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak hours */}
        <ChartCard title="Peak Hours" description="Today's auth volume by hour" index={1}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockPeakHours.slice(6, 19)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="auths" fill="#00E5A8" radius={[3, 3, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <ChartCard title="Recent Activity" description="Latest campus events" index={2}>
          <ActivityFeed items={mockEducationActivity} />
        </ChartCard>

        {/* Enrollment status */}
        <ChartCard title="Enrollment Status" description="Biometric enrollment completion" index={3}>
          <div className="space-y-3 py-2">
            {enrollmentData.map((item, i) => {
              const total = enrollmentData.reduce((a, d) => a + d.value, 0);
              const pct = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-white/55">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white/75">{item.value.toLocaleString()}</span>
                      <span className="text-white/25">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrollment summary */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: "Enrollment Rate", value: "93.4%", color: "text-[#00E5A8]", Icon: CheckCircle },
              { label: "Pending", value: "647", color: "text-[#fbbf24]", Icon: Clock },
              { label: "Failed Today", value: "24", color: "text-[#f87171]", Icon: XCircle },
              { label: "Offline Devices", value: "2", color: "text-[#f87171]", Icon: WifiOff },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.025] p-3">
                <stat.Icon className={cn("h-4 w-4", stat.color)} />
                <div>
                  <p className="text-[9.5px] text-white/30">{stat.label}</p>
                  <p className={cn("text-[14px] font-bold", stat.color)}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
