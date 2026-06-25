"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Plus, MoreHorizontal, Copy, RefreshCw, Trash2,
  Archive, Globe, Zap, Key, BarChart3, CheckCircle2, Circle,
  ArrowUpRight, ExternalLink, Shield, Webhook, X, Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface Project {
  id: string;
  organization_id: string;
  name: string;
  environment: string;
  status: string;
  description: string | null;
  allowed_origins: string[] | null;
  allowed_domains: string[] | null;
  webhook_url: string | null;
  rate_limit: number;
  created_at: string;
  updated_at: string;
}

interface ProjectStats {
  apiCalls: number;
  successRate: number;
  enrollments: number;
}

function ProjectCard({
  project,
  stats,
  onSelect,
  onDelete,
}: {
  project: Project;
  stats: ProjectStats;
  onSelect: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(project.id);
    toast.success("Project ID copied");
  };

  const getEnvColor = (env: string) => {
    const e = env.toLowerCase();
    if (e === "production") return "#00E5A8";
    if (e === "staging") return "#fbbf24";
    return "#818cf8";
  };

  const envColor = getEnvColor(project.environment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card rounded-2xl p-5 cursor-pointer group transition-all"
      onClick={() => onSelect(project)}
      style={{ borderRadius: 16 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${envColor}10`, border: `1px solid ${envColor}20` }}>
            <FolderOpen size={15} style={{ color: envColor }} />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-white leading-tight">{project.name}</p>
            <p className="text-[10.5px] mt-0.5 font-mono capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>
              {project.environment}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
            style={{
              background: project.status === "active" ? "rgba(0,229,168,0.1)" : "rgba(255,255,255,0.05)",
              color: project.status === "active" ? "#00E5A8" : "rgba(255,255,255,0.3)",
              border: project.status === "active" ? "1px solid rgba(0,229,168,0.2)" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {project.status === "active" ? "● Active" : "○ Inactive"}
          </span>
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <MoreHorizontal size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 w-40 rounded-xl overflow-hidden z-10"
                  style={{ background: "rgba(12,12,12,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
                  onClick={e => e.stopPropagation()}
                >
                  {[
                    { icon: Copy, label: "Copy ID", action: copyId, color: "rgba(255,255,255,0.6)" },
                    { icon: Trash2, label: "Delete", action: () => onDelete(project.id), color: "#f87171" },
                  ].map(({ icon: Icon, label, action, color }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[12px] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                      style={{ color }}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "API Calls", value: stats.apiCalls.toLocaleString() },
          { label: "Success Rate", value: stats.apiCalls > 0 ? `${stats.successRate}%` : "—" },
          { label: "Enrollments", value: stats.enrollments.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2.5 text-center"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[11px] font-semibold text-white">{s.value}</p>
            <p className="text-[9px] mt-0.5 uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.apiCalls > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Usage this month</span>
            <span className="text-[10px]" style={{ color: envColor }}>{stats.successRate}% pass rate</span>
          </div>
          <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-1 rounded-full" style={{ width: `${stats.successRate}%`, background: `linear-gradient(90deg, ${envColor}, ${envColor}88)` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="text-[10.5px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
          {project.id.slice(0, 16)}…
        </span>
        <span className="flex items-center gap-1 text-[10.5px] font-medium transition-colors group-hover:text-white"
          style={{ color: "rgba(0,194,255,0.6)" }}>
          Configure <ArrowUpRight size={10} />
        </span>
      </div>
    </motion.div>
  );
}

function ProjectDrawer({
  project,
  onClose,
  onSave,
}: {
  project: Project;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}) {
  const [webhookUrl, setWebhookUrl] = useState(project.webhook_url || "");
  const [origins, setOrigins] = useState((project.allowed_origins || []).join("\n"));
  const [rateLimit, setRateLimit] = useState(String(project.rate_limit || 100));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        webhook_url: webhookUrl.trim() || null,
        allowed_origins: origins ? origins.split("\n").map(o => o.trim()).filter(Boolean) : [],
        rate_limit: Number(rateLimit) || 100,
      };
      await onSave(payload);
      onClose();
    } catch {
      toast.error("Failed to save project settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] z-50 flex flex-col"
      style={{ background: "rgba(8,8,8,0.98)", borderLeft: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p className="text-[14px] font-semibold text-white">{project.name}</p>
          <p className="text-[11px] mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{project.id}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <X size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* API Info */}
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Project Environment</p>
          <div className="px-3.5 py-2.5 rounded-xl capitalize font-mono text-[12px] text-white"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {project.environment} Environment
          </div>
        </div>

        {/* Webhook */}
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Webhook size={9} className="inline mr-1.5" />Webhook URL
          </p>
          <input
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/neoface"
            className="w-full px-3.5 py-2.5 rounded-xl text-[12px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>

        {/* Allowed Origins */}
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Globe size={9} className="inline mr-1.5" />Allowed Origins
          </p>
          <textarea
            value={origins}
            onChange={e => setOrigins(e.target.value)}
            rows={4}
            placeholder="https://yourapp.com&#10;https://staging.yourapp.com"
            className="w-full px-3.5 py-2.5 rounded-xl text-[12px] text-white outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>One origin per line</p>
        </div>

        {/* Rate Limit */}
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            <Zap size={9} className="inline mr-1.5" />Rate Limit (req/s)
          </p>
          <input
            type="number"
            value={rateLimit}
            onChange={e => setRateLimit(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-[12px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
      </div>

      <div className="px-6 py-4 shrink-0 flex gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2"
          style={{ background: "#00C2FF", color: "#000" }}
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEnv, setNewEnv] = useState("production");

  // Load projects from backend
  const { data: projectsData, isLoading } = useQuery<{ items: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("projects").then(r => r.data),
  });

  // Load all sessions to calculate project-level statistics dynamically
  const { data: sessionsData } = useQuery<{ items: any[] }>({
    queryKey: ["all-sessions-stats"],
    queryFn: () => apiClient.get("sessions?page_size=200").then(r => r.data),
  });

  // Load all identities to calculate enrollment stats
  const { data: identitiesData } = useQuery<{ items: any[] }>({
    queryKey: ["all-identities-stats"],
    queryFn: () => apiClient.get("identities?page_size=200").then(r => r.data),
  });

  // Create Project mutation
  const createMutation = useMutation({
    mutationFn: (payload: { name: string; environment: string }) => apiClient.post("projects", payload),
    onSuccess: () => {
      toast.success(`Project "${newName}" created successfully!`);
      setCreating(false);
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to create project");
    }
  });

  // Update Project mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => apiClient.patch(`projects/${id}`, payload),
    onSuccess: () => {
      toast.success("Project settings saved");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to update project settings");
    }
  });

  // Delete Project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`projects/${id}`),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      toast.error("Failed to delete project");
    }
  });

  const projects = projectsData?.items ?? [];
  const sessions = sessionsData?.items ?? [];
  const identities = identitiesData?.items ?? [];

  // Helper to calculate project stats from raw queries
  const getProjectStats = (projectId: string): ProjectStats => {
    const projSessions = sessions.filter((s: any) => s.application_id === projectId);
    const projIdentities = identities.filter((i: any) => i.application_id === projectId);
    
    const apiCalls = projSessions.length;
    const successCount = projSessions.filter((s: any) => s.status === "success").length;
    const successRate = apiCalls > 0 ? Math.round((successCount / apiCalls) * 100) : 100;
    const enrollments = projIdentities.length;

    return { apiCalls, successRate, enrollments };
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName.trim(),
      environment: newEnv.toLowerCase(),
    });
  };

  const handleSaveProject = async (payload: any) => {
    if (!selected) return;
    await updateMutation.mutateAsync({ id: selected.id, payload });
    setSelected(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this project? This will invalidate all associated API credentials.")) {
      deleteMutation.mutate(id);
    }
  };

  // Aggregated totals
  const totalApiCalls = projects.reduce((acc, p) => acc + getProjectStats(p.id).apiCalls, 0);
  const totalEnrollments = projects.reduce((acc, p) => acc + getProjectStats(p.id).enrollments, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-[-0.02em]">Projects</h1>
          <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>
            Manage your identity integration projects, API keys, and configurations.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
          style={{ background: "#00C2FF", color: "#000" }}
        >
          <Plus size={14} /> New Project
        </button>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Projects", value: projects.length, color: "#00C2FF" },
          { label: "Active Projects", value: projects.filter(p => p.status === "active").length, color: "#00E5A8" },
          { label: "Total API Calls", value: totalApiCalls.toLocaleString(), color: "#818cf8" },
          { label: "Total Enrollments", value: totalEnrollments.toLocaleString(), color: "#fbbf24" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="dash-card p-4 rounded-xl">
            <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-[rgba(255,255,255,0.03)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <ProjectCard
                project={p}
                stats={getProjectStats(p.id)}
                onSelect={setSelected}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}

          {/* Add project card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            onClick={() => setCreating(true)}
            className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group"
            style={{ background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.08)", minHeight: 200 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,194,255,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ background: "rgba(0,194,255,0.08)", border: "1px solid rgba(0,194,255,0.15)" }}>
              <Plus size={16} style={{ color: "#00C2FF" }} />
            </div>
            <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Create new project</p>
          </motion.button>
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {creating && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80" onClick={() => setCreating(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-md rounded-2xl p-7 pointer-events-auto"
                style={{ background: "rgba(10,10,10,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[16px] font-semibold text-white">New Project</h2>
                  <button onClick={() => setCreating(false)}><X size={14} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Project name</label>
                    <input
                      value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="My Identity App"
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Environment</label>
                    <select value={newEnv} onChange={e => setNewEnv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                  <button
                    disabled={!newName.trim() || createMutation.isPending}
                    onClick={handleCreate}
                    className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity flex items-center justify-center gap-2"
                    style={{ background: "#00C2FF", color: "#000", opacity: newName.trim() && !createMutation.isPending ? 1 : 0.4 }}
                  >
                    {createMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                    Create Project
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Project Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50" onClick={() => setSelected(null)} />
            <ProjectDrawer
              project={selected}
              onClose={() => setSelected(null)}
              onSave={handleSaveProject}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
