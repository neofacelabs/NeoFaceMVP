"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useProjects, useCreateProject, useDeleteProject } from "@/lib/api/projects";
import { useSites } from "@/lib/api/sites";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Trash2, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function ProjectsPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const [siteFilter, setSiteFilter] = useState("");
  const [search, setSearch] = useState("");
  
  const { data: projectsData, isLoading } = useProjects(1, 50, undefined, undefined, undefined, search);
  const { data: sitesData } = useSites();
  const deleteProjectMutation = useDeleteProject();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project? All associated API keys and credentials will be permanently deleted.")) {
      await deleteProjectMutation.mutateAsync(id);
    }
  };

  const projects = (projectsData?.items || []).filter((p: any) => !siteFilter || p.site_id === siteFilter);
  const sites = sitesData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Projects"
        description="Configure and monitor your developer applications, liveness settings, and site scopes."
        breadcrumbs={[{ label: "Organization" }, { label: "Projects" }]}
        actions={
          <Link href={`/org-admin/projects/new`}>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-white/[0.05] pb-4">
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
          />
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
          >
            <option value="" className="bg-[#0c0c0c]">All Sites</option>
            {sites.map((s: any) => (
              <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No identity projects found matching criteria.</p>
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
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card cursor-pointer"
              >
                <Link href={`/org-admin/projects/${project.id}`} className="absolute inset-0" />
                
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                      <FolderKanban className="h-4 w-4 text-[#00E5A8]" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-white/90 group-hover:text-white transition-colors">{project.name}</h3>
                      <p className="text-[10.5px] text-white/35">{project.environment} environment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-white/50 line-clamp-2 min-h-[32px]">
                    {project.description || "No description provided."}
                  </p>
                  {site && (
                    <div className="mt-2 text-[10px] text-white/30 flex items-center gap-1">
                      <span>Site:</span>
                      <span className="text-[#00E5A8] font-medium">{site.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    {project.status || "active"}
                  </span>
                  <span className="text-[10px] text-white/20">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
