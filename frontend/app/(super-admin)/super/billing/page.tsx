"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockBilling } from "@/lib/mock-data/super-admin";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, Building2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/[0.09] bg-[#0a0a0a] px-3 py-2 shadow-modal">
      <p className="mb-1 text-[10.5px] text-white/40">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="text-[11px] text-white/60">{p.name}:</span>
          <span className="text-[11px] font-bold text-white">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const statusColors: Record<string, { text: string; bg: string }> = {
  paid: { text: "text-[#00E5A8]", bg: "bg-[#00E5A8]/8" },
  pending: { text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/8" },
  overdue: { text: "text-[#f87171]", bg: "bg-[#f87171]/8" },
  trial: { text: "text-[#38BDF8]", bg: "bg-[#38BDF8]/8" },
};

const planColors: Record<string, string> = {
  Enterprise: "text-[#00E5A8]",
  Pro: "text-[#38BDF8]",
  Starter: "text-white/40",
};

const mrr = mockBilling.reduce((acc, b) => acc + b.total_usd, 0);
const overdue = mockBilling.filter((b) => b.status === "overdue").reduce((acc, b) => acc + b.total_usd, 0);

const mrrTrend = [
  { month: "Jan", mrr: 7200 },
  { month: "Feb", mrr: 8100 },
  { month: "Mar", mrr: 9400 },
  { month: "Apr", mrr: 11200 },
  { month: "May", mrr: 12800 },
  { month: "Jun", mrr: mrr },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Revenue overview, subscription management, and invoice tracking."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Billing" }]}
        actions={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        }
      />

      <KPIGrid columns={4}>
        <KPICard label="Monthly Revenue" value={`$${mrr.toLocaleString()}`} trend={14} trend_direction="up" color="success" index={0} />
        <KPICard label="Paying Customers" value={mockBilling.filter(b => b.status === "paid").length} index={1} color="accent" />
        <KPICard label="Overdue" value={`$${overdue.toLocaleString()}`} color="error" index={2} />
        <KPICard label="Trial Accounts" value={mockBilling.filter(b => b.status === "trial").length} color="warning" index={3} />
      </KPIGrid>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* MRR trend */}
        <ChartCard title="MRR Trend" description="Monthly recurring revenue" className="lg:col-span-2" index={0}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mrrTrend} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mrr" name="MRR" fill="#00E5A8" radius={[5, 5, 0, 0]} fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Plan distribution */}
        <ChartCard title="Revenue by Plan" description="Current period breakdown" index={1}>
          <div className="space-y-3 py-2">
            {[
              { plan: "Enterprise", amount: 11340, orgs: 2, color: "#00E5A8" },
              { plan: "Pro", amount: 3120, orgs: 2, color: "#38BDF8" },
              { plan: "Starter", amount: 0, orgs: 1, color: "rgba(255,255,255,0.2)" },
            ].map((row, i) => {
              const total = 14460;
              const pct = total > 0 ? ((row.amount / total) * 100).toFixed(0) : 0;
              return (
                <div key={row.plan} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-white/60">{row.plan}</span>
                    <span className="font-semibold text-white/80">${row.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.12 }}
                      className="h-full rounded-full"
                      style={{ background: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Billing table */}
      <ChartCard title="Organization Billing" description="Current period invoices" index={2} className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Base MRR</TableHead>
              <TableHead className="text-right">Overage</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Auths (30d)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBilling.map((b, i) => {
              const s = statusColors[b.status] ?? { text: "text-white/40", bg: "bg-white/[0.04]" };
              return (
                <motion.tr
                  key={b.org_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="text-[12.5px] font-semibold text-white/85">{b.org_name}</p>
                      <p className="text-[10.5px] text-white/30">{b.period}</p>
                    </div>
                  </TableCell>
                  <TableCell className={cn("text-[12px] font-semibold", planColors[b.plan] ?? "text-white/50")}>{b.plan}</TableCell>
                  <TableCell className="text-right font-mono text-[12px] text-white/60">${b.mrr_usd.toLocaleString()}</TableCell>
                  <TableCell className={cn("text-right font-mono text-[12px]", b.overage_usd > 0 ? "text-[#fbbf24]" : "text-white/25")}>
                    {b.overage_usd > 0 ? `+$${b.overage_usd}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[13px] font-bold text-white/80">${b.total_usd.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-[11px] text-white/40">{b.auth_count.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", s.bg, s.text)}>
                      {b.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] border-white/10 text-white/40 hover:text-white hover:bg-white/[0.05]">
                      Invoice
                    </Button>
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
