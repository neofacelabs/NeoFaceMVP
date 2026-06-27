"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useIdentities, useCreateIdentity, useUpdateIdentity, useDeleteIdentity } from "@/lib/api/identities";
import { useSites } from "@/lib/api/sites";
import { useProjects } from "@/lib/api/projects";
import { Button } from "@/components/ui/button";
import { Users, Plus, Trash2, ShieldAlert, Check, Loader2, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function IdentitiesPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projFilter, setProjFilter] = useState("");

  const { data: identitiesData, isLoading } = useIdentities(
    page,
    20,
    undefined,
    projFilter || undefined,
    undefined,
    statusFilter || undefined,
    typeFilter || undefined,
    siteFilter || undefined,
    search || undefined
  );
  
  const { data: sitesData } = useSites();
  const { data: projectsData } = useProjects(1, 100);
  const createIdentityMutation = useCreateIdentity();
  const updateIdentityMutation = useUpdateIdentity();
  const deleteIdentityMutation = useDeleteIdentity();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [extId, setExtId] = useState("");
  const [selProj, setSelProj] = useState("");
  const [selType, setSelType] = useState("member");
  const [selSite, setSelSite] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extId.trim() || !selProj) return;
    await createIdentityMutation.mutateAsync({
      external_user_id: extId,
      application_id: selProj,
      identity_type: selType,
      site_id: selSite || undefined,
    });
    setExtId("");
    setIsCreateOpen(false);
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    await updateIdentityMutation.mutateAsync({
      identityId: id,
      payload: { status: nextStatus }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this identity and clear all biometric records?")) {
      await deleteIdentityMutation.mutateAsync(id);
    }
  };

  const identities = identitiesData?.items || [];
  const sites = sitesData?.items || [];
  const projects = projectsData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identities Directory"
        description="Unified registry of all biometric subjects, site associations, and credential states."
        breadcrumbs={[{ label: "Organization" }, { label: "Identities" }]}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Register Identity
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">Register Biometric Identity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">External User ID / Badge Number</label>
                  <input
                    type="text"
                    value={extId}
                    onChange={(e) => setExtId(e.target.value)}
                    placeholder="e.g. EMP-9021, STU-1002"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Workspace / Project Scope</label>
                  <select
                    value={selProj}
                    onChange={(e) => setSelProj(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id} className="bg-[#0c0c0c]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Identity Type</label>
                  <select
                    value={selType}
                    onChange={(e) => setSelType(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="employee" className="bg-[#0c0c0c]">Employee</option>
                    <option value="student" className="bg-[#0c0c0c]">Student</option>
                    <option value="faculty" className="bg-[#0c0c0c]">Faculty</option>
                    <option value="visitor" className="bg-[#0c0c0c]">Visitor</option>
                    <option value="contractor" className="bg-[#0c0c0c]">Contractor</option>
                    <option value="resident" className="bg-[#0c0c0c]">Resident</option>
                    <option value="guest" className="bg-[#0c0c0c]">Guest</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Physical Site Location</label>
                  <select
                    value={selSite}
                    onChange={(e) => setSelSite(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="">Select Site (Optional)</option>
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createIdentityMutation.isPending}>
                    {createIdentityMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Register
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] pb-4">
        <div className="relative flex items-center min-w-[200px]">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-white/20" />
          <input
            type="text"
            placeholder="Search external ID..."
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="employee">Employee</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="visitor">Visitor</option>
          <option value="contractor">Contractor</option>
          <option value="resident">Resident</option>
          <option value="guest">Guest</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All States</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : identities.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No enrolled identities found matching filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.065] bg-white/[0.015]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45">
                <th className="px-4 py-3 font-semibold">Identity ID</th>
                <th className="px-4 py-3 font-semibold">External User ID</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Associated Site</th>
                <th className="px-4 py-3 font-semibold">Enrollment Status</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Date Registered</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {identities.map((identity: any) => {
                const site = sites.find((s: any) => s.id === identity.site_id);
                return (
                  <tr key={identity.id} className="text-white/70 hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3 font-mono text-[10.5px] text-white/40">{identity.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-semibold text-white/80">{identity.external_user_id}</td>
                    <td className="px-4 py-3 capitalize">{identity.identity_type}</td>
                    <td className="px-4 py-3">{site ? site.name : <span className="text-white/25">None</span>}</td>
                    <td className="px-4 py-3">
                      <span className={identity.enrollment_status === "enrolled" ? "text-emerald-400" : "text-amber-400"}>
                        {identity.enrollment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={identity.status === "active" ? "text-emerald-400" : "text-rose-400"}>
                        {identity.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(identity.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleStatusToggle(identity.id, identity.status)}
                        className="rounded px-2 py-1 text-[10.5px] font-semibold border border-white/10 hover:bg-white/5 transition-all text-white/60"
                      >
                        {identity.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(identity.id)}
                        className="rounded p-1 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all inline-flex items-center justify-center align-middle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
