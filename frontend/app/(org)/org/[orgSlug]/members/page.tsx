"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useMembersAndRoles, useUpdateMemberRole } from "@/lib/api/roles";
import { Button } from "@/components/ui/button";
import { Users, Plus, Shield, Loader2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function WorkspaceMembersPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  const [page, setPage] = useState(1);
  const { data: membersData, isLoading, refetch } = useMembersAndRoles(page, 20);
  const updateRoleMutation = useUpdateMemberRole();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    try {
      setSubmitting(true);
      // Register/invite user to this organization
      await apiClient.post("users", { name, email, role });
      toast.success("Workspace membership invitation sent successfully!");
      setEmail("");
      setName("");
      setIsInviteOpen(false);
      refetch();
    } catch {
      toast.error("Failed to add member to workspace.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success("Member workspace role updated.");
      refetch();
    } catch {
      toast.error("Failed to update member role.");
    }
  };

  const members = membersData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members & Workspace RBAC"
        description="Invite organization administrators, security staff, and enrollment officers, and restrict granular permissions."
        breadcrumbs={[{ label: "Organization" }, { label: "Members" }]}
        actions={
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">Invite Workspace Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Workspace Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="admin">Organization Admin</option>
                    <option value="project_admin">Project Admin</option>
                    <option value="enrollment_officer">Enrollment Officer</option>
                    <option value="security_officer">Security Officer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Invite Member
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
      ) : members.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No workspace members found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.065] bg-white/[0.015]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Workspace Role</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {members.map((member: any) => (
                <tr key={member.id} className="text-white/70 hover:bg-white/[0.01] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white/80">{member.name}</td>
                  <td className="px-4 py-3 text-white/50">{member.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="rounded border border-white/10 bg-white/[0.02] px-2 py-1 text-xs text-white/70 focus:outline-none"
                    >
                      <option value="admin" className="bg-[#0c0c0c]">Org Admin</option>
                      <option value="project_admin" className="bg-[#0c0c0c]">Project Admin</option>
                      <option value="enrollment_officer" className="bg-[#0c0c0c]">Enrollment Officer</option>
                      <option value="security_officer" className="bg-[#0c0c0c]">Security Officer</option>
                      <option value="viewer" className="bg-[#0c0c0c]">Viewer</option>
                      <option value="user" className="bg-[#0c0c0c]">Member</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.role === "admin" ? (
                      <span className="text-[10px] text-white/30 uppercase font-semibold">Workspace Owner</span>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(member.id, "viewer")}
                        className="text-[11px] text-red-400 hover:underline"
                      >
                        Reset to Viewer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
