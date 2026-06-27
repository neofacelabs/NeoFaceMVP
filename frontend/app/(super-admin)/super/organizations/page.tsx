"use client";

import React from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, ExternalLink, Pause, Trash2, Building2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const planColors: Record<string, string> = {
  enterprise: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20",
  pro: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20",
  starter: "text-white/50 bg-white/5 border-white/10",
  free: "text-white/30 bg-white/[0.03] border-white/[0.07]",
};

const orgStatusColors: Record<string, string> = {
  active: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20",
  suspended: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
  trial: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20",
  churned: "text-white/25 bg-white/[0.03] border-white/[0.06]",
};

import { useOrganizations, useUpdateOrganization } from "@/lib/api";
import { toast } from "sonner";

export default function OrganizationsPage() {
  const [search, setSearch] = React.useState("");
  const { data, isLoading, refetch } = useOrganizations(1, 100, undefined, search || undefined);
  const updateMutation = useUpdateOrganization();

  const handleUpdateStatus = async (orgId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ orgId, payload: { status } });
      toast.success(`Organization status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update organization status");
    }
  };

  const orgs = (data?.items || []).map((o: any) => {
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      owner_name: o.owner_name || "Enterprise Admin",
      industry: o.industry || "Software & SaaS",
      plan: o.plan || "pro",
      member_count: o.member_count || 0,
      auth_count_30d: o.auth_count_30d || 0,
      status: o.status || "active",
      created_at: o.created_at,
    };
  });

  const filtered = orgs;

  const totalOrgs = data?.total || 0;
  const enterpriseOrgs = (data?.items || []).filter((o: any) => o.plan === "enterprise").length;
  const proOrgs = (data?.items || []).filter((o: any) => o.plan === "pro").length;
  const trialOrgs = (data?.items || []).filter((o: any) => o.status === "trial").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="All tenant organizations registered on NeoFace Cloud."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Organizations" }]}
        actions={
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Organization
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orgs", value: totalOrgs, color: "text-white" },
          { label: "Enterprise", value: enterpriseOrgs, color: "text-[#00E5A8]" },
          { label: "Pro", value: proOrgs, color: "text-[#38BDF8]" },
          { label: "On Trial", value: trialOrgs, color: "text-[#fbbf24]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-[12px] border border-white/[0.065] bg-white/[0.025] p-4"
          >
            <p className="kpi-label mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <ChartCard title="All Organizations" description="Click an organization to view its workspace." index={0}>
        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
          <Search className="h-3.5 w-3.5 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead className="text-right">Auth / 30d</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((org: any, i: number) => (
              <motion.tr
                key={org.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025] cursor-pointer"
              >
                <TableCell>
                  <Link href={`/org/${org.slug}`} className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                      <Building2 className="h-4 w-4 text-white/30" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/85 group-hover:text-[#00E5A8] transition-colors">{org.name}</p>
                      <p className="text-[10.5px] text-white/30">{org.owner_name}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-white/50">{org.industry}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${planColors[org.plan]}`}>
                    {org.plan}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-[12px] text-white/60">{org.member_count.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-[12px] text-white/60">{org.auth_count_30d.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${orgStatusColors[org.status]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-white/30 text-[11px]">
                  {formatDistanceToNow(new Date(org.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/60 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl border border-white/[0.09] bg-[#0a0a0a] p-1">
                      <DropdownMenuItem asChild className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                        <Link href={`/org/${org.slug}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Workspace
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(org.id, org.status === "suspended" ? "active" : "suspended")}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer"
                      >
                        <Pause className="h-3.5 w-3.5" />
                        {org.status === "suspended" ? "Activate" : "Suspend"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(org.id, "cancelled")}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#f87171]/60 hover:bg-[#f87171]/[0.06] hover:text-[#f87171] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Cancel Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
