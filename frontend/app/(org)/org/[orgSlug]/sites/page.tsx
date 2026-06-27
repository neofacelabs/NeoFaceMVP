"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from "@/lib/api/sites";
import { Button } from "@/components/ui/button";
import { Map, Plus, Trash2, Edit2, Loader2, Check, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function SitesPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  const { data: sitesData, isLoading } = useSites();
  const createSiteMutation = useCreateSite();
  const updateSiteMutation = useUpdateSite();
  const deleteSiteMutation = useDeleteSite();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createSiteMutation.mutateAsync({ name, description });
    setName("");
    setDescription("");
    setIsCreateOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this site? All associated resources will be unlinked.")) {
      await deleteSiteMutation.mutateAsync(id);
    }
  };

  const sites = sitesData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Sites"
        description="Manage your organization's physical sites, locations, and campuses."
        breadcrumbs={[{ label: "Organization" }, { label: "Sites" }]}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Register Site
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">Register Physical Site</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Site Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. London Office, North Campus"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide site details..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    rows={3}
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createSiteMutation.isPending}>
                    {createSiteMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Register
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <Map className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No physical sites registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site: any, i: number) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                    <Map className="h-4 w-4 text-[#00E5A8]" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-white/90">{site.name}</h3>
                    <p className="text-[10.5px] text-white/35">ID: {site.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/50 min-h-[32px] line-clamp-2 mb-4">
                {site.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <Check className="h-3 w-3" />
                  {site.status}
                </span>
                <span className="text-[10px] text-white/20">
                  Created {new Date(site.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
