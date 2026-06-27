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
import { useProjects, useUpdateProject, useDeleteProject } from "@/lib/api";
import { Plus, Search, MoreHorizontal, Pause, Play, Trash2, FolderKanban, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [envFilter, setEnvFilter] = React.useState("");

  const { data, isLoading, refetch } = useProjects(page, 50, undefined, envFilter || undefined, statusFilter || undefined, search || undefined);
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const handleUpdateStatus = async (projectId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ projectId, payload: { status } });
      toast.success(`Project status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update project status");
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This will purge all associated API keys, identities, and biometric sessions.")) return;
    try {
      await deleteMutation.mutateAsync(projectId);
      toast.success("Project deleted successfully");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const projects = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="All application environments and developer projects registered on the platform."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Projects" }]}
        actions={
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Projects", value: total, color: "text-white" },
          { label: "Production", value: projects.filter((p: any) => p.environment === "production").length, color: "text-[#00E5A8]" },
          { label: "Staging", value: projects.filter((p: any) => p.environment === "staging").length, color: "text-[#38BDF8]" },
          { label: "Active", value: projects.filter((p: any) => p.status === "active").length, color: "text-[#00E5A8]" },
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
      <ChartCard title="Project Registry" description="Manage access control, domains, and active status for developer projects." index={0}>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            No projects found matching the criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Allowed Domains</TableHead>
                <TableHead className="text-right">Rate Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-white/30" />
                      <div>
                        <p className="font-semibold text-white">{project.name}</p>
                        <p className="text-[10px] text-white/45">ID: {project.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
                      project.environment === "production" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      project.environment === "staging" ? "border-sky-500/20 bg-sky-500/10 text-sky-400" :
                      "border-white/10 bg-white/5 text-white/50"
                    )}>
                      {project.environment}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-white/70">
                      {project.allowed_domains && project.allowed_domains.length > 0
                        ? project.allowed_domains.join(", ")
                        : "Any (*)"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-white/80">
                    {project.rate_limit} req/m
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                      project.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      project.status === "suspended" ? "border-red-500/20 bg-red-500/10 text-red-400" :
                      "border-white/10 bg-white/5 text-white/45"
                    )}>
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/5 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[140px] border-white/[0.08] bg-[#0c0c0c] text-white">
                        {project.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, "suspended")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                            <Pause className="h-3.5 w-3.5 text-yellow-500" />
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, "active")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                            <Play className="h-3.5 w-3.5 text-emerald-500" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(project.id)} className="gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
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
