"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useIdentities, useUpdateIdentity, useResetBiometrics, useDeleteIdentity } from "@/lib/api";
import { Search, MoreHorizontal, Pause, Play, Trash2, User, RefreshCw, KeyRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function IdentitiesPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [enrollFilter, setEnrollFilter] = React.useState("");

  const { data, isLoading, refetch } = useIdentities(
    page,
    50,
    undefined,
    undefined,
    enrollFilter || undefined,
    statusFilter || undefined,
    typeFilter || undefined,
    search || undefined
  );

  const updateMutation = useUpdateIdentity();
  const resetBiometricsMutation = useResetBiometrics();
  const deleteMutation = useDeleteIdentity();

  const handleUpdateStatus = async (identityId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ identityId, payload: { status } });
      toast.success(`Identity status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleResetBiometrics = async (identityId: string) => {
    if (!confirm("Are you sure you want to reset this identity's biometrics? This will permanently delete their enrolled face embedding and fingerprint keys.")) return;
    try {
      await resetBiometricsMutation.mutateAsync(identityId);
      toast.success("Identity biometrics reset successfully");
    } catch (err) {
      toast.error("Failed to reset biometrics");
    }
  };

  const handleDelete = async (identityId: string) => {
    if (!confirm("Are you sure you want to delete this identity profile? This action is irreversible.")) return;
    try {
      await deleteMutation.mutateAsync(identityId);
      toast.success("Identity deleted successfully");
    } catch (err) {
      toast.error("Failed to delete identity");
    }
  };

  const identities = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identities"
        description="Unified registry of all verified biometric subject profiles enrolled on the platform."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Identities" }]}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Identities", value: total, color: "text-white" },
          { label: "Face Enrolled", value: identities.filter((i: any) => i.enrollment_status === "enrolled").length, color: "text-[#00E5A8]" },
          { label: "Fingerprint Enrolled", value: identities.filter((i: any) => i.is_fingerprint_enrolled).length, color: "text-[#38BDF8]" },
          { label: "Active", value: identities.filter((i: any) => i.status === "active").length, color: "text-[#00E5A8]" },
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
      <ChartCard title="Global Identity Directory" description="Explore, filter, and inspect enrolled subjects and biometrics status." index={0}>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search identities (external user ID)..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Identity Types</option>
              <option value="member">Member</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
              <option value="visitor">Visitor</option>
              <option value="contractor">Contractor</option>
            </select>

            <select
              value={enrollFilter}
              onChange={(e) => setEnrollFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">Biometrics Status</option>
              <option value="enrolled">Enrolled</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Lifecycles</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            Loading identities...
          </div>
        ) : identities.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            No identities found matching the filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>External User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Enrollment Status</TableHead>
                <TableHead>Key Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {identities.map((identity: any) => (
                <TableRow key={identity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                        <User className="h-4 w-4 text-white/45" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{identity.external_user_id}</p>
                        <p className="text-[10px] text-white/40">UUID: {identity.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-white/70 capitalize">
                    {identity.identity_type}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                      identity.enrollment_status === "enrolled" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      identity.enrollment_status === "pending" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400" :
                      "border-red-500/20 bg-red-500/10 text-red-400"
                    )}>
                      {identity.enrollment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[10.5px]">
                      {identity.face_embedding_id && (
                        <span className="rounded bg-[#00E5A8]/10 px-1 py-0.5 text-[#00E5A8] border border-[#00E5A8]/15">Face</span>
                      )}
                      {identity.is_fingerprint_enrolled && (
                        <span className="rounded bg-sky-500/10 px-1 py-0.5 text-sky-400 border border-sky-500/15">Fingerprint</span>
                      )}
                      {!identity.face_embedding_id && !identity.is_fingerprint_enrolled && (
                        <span className="text-white/30">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                      identity.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      identity.status === "suspended" ? "border-red-500/20 bg-red-500/10 text-red-400" :
                      "border-white/10 bg-white/5 text-white/45"
                    )}>
                      {identity.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">
                    {formatDistanceToNow(new Date(identity.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/5 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] border-white/[0.08] bg-[#0c0c0c] text-white">
                        {identity.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(identity.id, "suspended")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                            <Pause className="h-3.5 w-3.5 text-yellow-500" />
                            Suspend Profile
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(identity.id, "active")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                            <Play className="h-3.5 w-3.5 text-emerald-500" />
                            Activate Profile
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleResetBiometrics(identity.id)} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                          <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                          Reset Biometrics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(identity.id)} className="gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                          Purge Identity
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>
    </div>
  );
}
