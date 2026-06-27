"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAccessZones, useCreateAccessZone, useDeleteAccessZone } from "@/lib/api/access-zones";
import { useSites } from "@/lib/api/sites";
import { Button } from "@/components/ui/button";
import { Map, Plus, Trash2, Loader2, Check, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AccessZonesPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  
  const [siteFilter, setSiteFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: zonesData, isLoading, refetch } = useAccessZones(1, 50, siteFilter || undefined, search || undefined);
  const { data: sitesData } = useSites();
  const createZoneMutation = useCreateAccessZone();
  const deleteZoneMutation = useDeleteAccessZone();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selSite, setSelSite] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createZoneMutation.mutateAsync({
        name,
        description,
        site_id: selSite || undefined,
        allowed_identities: [],
        allowed_projects: [],
        assigned_devices: [],
        allowed_schedule: {},
        security_policies: {},
      });
      toast.success("Access zone created successfully!");
      setName("");
      setDescription("");
      setIsCreateOpen(false);
      refetch();
    } catch {
      toast.error("Failed to create access zone.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this access zone? Security policies associated will be wiped.")) {
      await deleteZoneMutation.mutateAsync(id);
      toast.success("Access zone deleted.");
      refetch();
    }
  };

  const zones = zonesData?.items || [];
  const sites = sitesData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Zones"
        description="Define and secure spatial boundaries, authorize biometric categories, and associate readers."
        breadcrumbs={[{ label: "Organization" }, { label: "Access Zones" }]}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                New Zone
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">Create Access Zone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Zone Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Server Room Entrance, Executive Suite"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the secured access area..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Physical Site Assignment</label>
                  <select
                    value={selSite}
                    onChange={(e) => setSelSite(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="">Select Site</option>
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createZoneMutation.isPending}>
                    {createZoneMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Create Zone
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] pb-4">
        <div className="relative flex items-center min-w-[200px]">
          <Plus className="absolute left-2.5 h-3.5 w-3.5 text-white/20" />
          <input
            type="text"
            placeholder="Search access zones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
          />
        </div>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Sites</option>
          {sites.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : zones.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <Lock className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No access zones found in this scope.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone: any, i: number) => {
            const site = sites.find((s: any) => s.id === zone.site_id);
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                      <Lock className="h-4 w-4 text-[#00E5A8]" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-white/90">{zone.name}</h3>
                      {site && <p className="text-[10px] text-white/35">Site: {site.name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 min-h-[32px] mb-4">
                  {zone.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10px] text-white/30">
                  <span>Devices assigned: {zone.assigned_devices?.length || 0}</span>
                  <span>Created {new Date(zone.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
