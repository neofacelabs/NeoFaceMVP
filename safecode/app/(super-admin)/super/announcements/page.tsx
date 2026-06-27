"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { useBroadcasts, useCreateBroadcast, useDeleteBroadcast } from "@/lib/api";
import { Megaphone, Plus, Trash2, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [severity, setSeverity] = React.useState("info");
  const [target, setTarget] = React.useState("all_organizations");

  const { data, isLoading } = useBroadcasts();
  const createMutation = useCreateBroadcast();
  const deleteMutation = useDeleteBroadcast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Title and message are required");
      return;
    }

    try {
      await createMutation.mutateAsync({ title, message, severity, target });
      toast.success("Broadcast announcement posted successfully");
      setTitle("");
      setMessage("");
    } catch (err) {
      toast.error("Failed to post announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this announcement? It will immediately stop showing on active client portals.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Announcement removed");
    } catch (err) {
      toast.error("Failed to remove announcement");
    }
  };

  const notices = data?.broadcasts || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcast Banners"
        description="Broadcast system-wide notices, planned maintenance banners, or alerts to organization portals."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Notifications" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Broadcast form */}
        <div>
          <ChartCard title="New System Banner" description="Configure alert severity and target audience." index={0}>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">Announcement Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled DB Maintenance"
                  className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5A8]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">Banner Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about the maintenance or notification..."
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#00E5A8]/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                    <option value="error">Critical (Red)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">Audience</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
                  >
                    <option value="all_organizations">All Organizations</option>
                    <option value="enterprise_tier">Enterprise Plan Only</option>
                  </select>
                </div>
              </div>

              <Button type="submit" size="sm" className="w-full gap-1.5 h-8 text-xs bg-[#00E5A8] text-black hover:bg-[#00c28e]">
                <Plus className="h-3.5 w-3.5" /> Broadcast Announcement
              </Button>
            </form>
          </ChartCard>
        </div>

        {/* Active broadcasts list */}
        <div className="lg:col-span-2">
          <ChartCard title="Active System Announcements" description="Live banners currently active across organization workspaces." index={1}>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading broadcasts...</div>
            ) : notices.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/45 gap-1.5">
                <Megaphone className="h-4 w-4 text-white/30" /> No active announcements.
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice: any) => (
                  <motion.div
                    key={notice.id}
                    layout
                    className={cn(
                      "flex items-start justify-between rounded-xl border p-4 text-xs",
                      notice.severity === "error" ? "border-red-500/20 bg-red-500/5 text-red-200" :
                      notice.severity === "warning" ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-200" :
                      notice.severity === "success" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200" :
                      "border-sky-500/20 bg-sky-500/5 text-sky-200"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {notice.severity === "error" ? <ShieldAlert className="h-4 w-4 text-red-400" /> :
                         notice.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-yellow-400" /> :
                         notice.severity === "success" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> :
                         <Megaphone className="h-4 w-4 text-sky-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{notice.title}</h4>
                        <p className="mt-1 text-white/70 leading-relaxed">{notice.message}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-[10px] text-white/40">
                          <span>Target: <strong className="text-white/60 capitalize">{notice.target.replace("_", " ")}</strong></span>
                          <span>•</span>
                          <span>Posted {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => handleDelete(notice.id)} className="text-white/40 hover:text-white shrink-0 ml-4 mt-0.5">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
