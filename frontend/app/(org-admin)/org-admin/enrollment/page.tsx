"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useIdentities, useCreateIdentity } from "@/lib/api/identities";
import { useProjects } from "@/lib/api/projects";
import { useSites } from "@/lib/api/sites";
import { Button } from "@/components/ui/button";
import { Fingerprint, Plus, Loader2, Check, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function OrganizationEnrollmentPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedProj, setSelectedProj] = useState("");

  const { data: identitiesData, isLoading, refetch } = useIdentities(
    page,
    50,
    undefined,
    selectedProj || undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    search || undefined
  );

  const { data: projectsData } = useProjects(1, 100);
  const { data: sitesData } = useSites();
  const createIdentityMutation = useCreateIdentity();

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [extId, setExtId] = useState("");
  const [targetProj, setTargetProj] = useState("");
  const [targetSite, setTargetSite] = useState("");
  const [type, setType] = useState("employee");
  
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extId.trim() || !targetProj) return;
    try {
      await createIdentityMutation.mutateAsync({
        external_user_id: extId,
        application_id: targetProj,
        identity_type: type,
        site_id: targetSite || undefined,
      });
      toast.success("Identity enrolled successfully!");
      setExtId("");
      setIsEnrollOpen(false);
      refetch();
    } catch {
      toast.error("Failed to enroll identity.");
    }
  };

  const identities = identitiesData?.items || [];
  const projects = projectsData?.items || [];
  const sites = sitesData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biometric Enrollment"
        description="Enroll identity subjects, capture credentials, and map workspace authentication scopes."
        breadcrumbs={[{ label: "Organization" }, { label: "Enrollment" }]}
        actions={
          <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Enroll Identity
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">New Biometric Enrollment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEnroll} className="space-y-4 pt-2">
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
                  <label className="text-[11px] font-medium text-white/40">Target Project Scope</label>
                  <select
                    value={targetProj}
                    onChange={(e) => setTargetProj(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  >
                    <option value="">Select Project Scope</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id} className="bg-[#0c0c0c]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Site Location</label>
                  <select
                    value={targetSite}
                    onChange={(e) => setTargetSite(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="">Select Site (Optional)</option>
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Identity Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="visitor">Visitor</option>
                    <option value="contractor">Contractor</option>
                    <option value="resident">Resident</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEnrollOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createIdentityMutation.isPending}>
                    {createIdentityMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Initiate Enrollment
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
          value={selectedProj}
          onChange={(e) => setSelectedProj(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Projects</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : identities.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <Fingerprint className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No identity enrollment queues active.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.065] bg-white/[0.015]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45">
                <th className="px-4 py-3 font-semibold">Subject Identifier</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Associated Site</th>
                <th className="px-4 py-3 font-semibold">Face State</th>
                <th className="px-4 py-3 font-semibold">Fingerprint State</th>
                <th className="px-4 py-3 font-semibold">Iris State</th>
                <th className="px-4 py-3 font-semibold">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {identities.map((identity: any) => {
                const site = sites.find((s: any) => s.id === identity.site_id);
                return (
                  <tr key={identity.id} className="text-white/70 hover:bg-white/[0.01] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white/80">{identity.external_user_id}</td>
                    <td className="px-4 py-3 capitalize">{identity.identity_type}</td>
                    <td className="px-4 py-3">{site ? site.name : <span className="text-white/25">None</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {identity.enrollment_status === "enrolled" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {identity.is_fingerprint_enrolled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/25">
                            Not Enrolled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {identity.is_iris_enrolled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/25">
                            Not Enrolled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(identity.created_at).toLocaleDateString()}</td>
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
