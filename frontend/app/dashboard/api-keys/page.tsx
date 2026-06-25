"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Plus, Copy, RotateCcw, Trash2, Eye, EyeOff, Shield,
  AlertTriangle, CheckCircle2, Loader2, X
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface ApiKey {
  id: string;
  organization_id: string;
  application_id: string | null;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

const SCOPE_COLORS: Record<string, string> = {
  "identity:read": "#00C2FF",
  "identity:write": "#00E5A8",
  "session:read": "#818cf8",
  "session:write": "#f87171",
  "liveness:read": "#fbbf24",
  "liveness:write": "#fbbf24",
};

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string>("global");
  const [revealId, setRevealId] = useState<string | null>(null);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);

  // Load API Keys
  const { data: keysData, isLoading } = useQuery<{ items: ApiKey[] }>({
    queryKey: ["api-keys"],
    queryFn: () => apiClient.get("api-keys").then(r => r.data),
  });

  // Load Projects to allow key-to-project binding
  const { data: projectsData } = useQuery<{ items: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("projects").then(r => r.data),
  });

  const apiKeys = keysData?.items ?? [];
  const projects = projectsData?.items ?? [];

  // Create API Key Mutation
  const createMutation = useMutation({
    mutationFn: (payload: { name: string; application_id: string | null; scopes: string[] }) =>
      apiClient.post("api-keys", payload).then(r => r.data),
    onSuccess: (data) => {
      setPlaintextKey(data.plaintext_key);
      setShowNew(false);
      setNewKeyName("");
      setSelectedAppId("global");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to create API key");
    }
  });

  // Revoke API Key Mutation
  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`api-keys/${id}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked successfully");
    },
    onError: () => {
      toast.error("Failed to revoke API key");
    }
  });

  // Rotate API Key Mutation
  const rotateMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`api-keys/${id}/rotate`).then(r => r.data),
    onSuccess: (data) => {
      setPlaintextKey(data.plaintext_key);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key rotated successfully");
    },
    onError: () => {
      toast.error("Failed to rotate API key");
    }
  });

  const handleGenerate = () => {
    if (!newKeyName.trim()) return;
    createMutation.mutate({
      name: newKeyName.trim(),
      application_id: selectedAppId === "global" ? null : selectedAppId,
      scopes: ["identity:read", "identity:write", "session:read"], // Default helper scopes
    });
  };

  const handleRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? Any applications currently using this key will immediately fail to authenticate.")) {
      revokeMutation.mutate(id);
    }
  };

  const handleRotate = (id: string) => {
    if (confirm("Are you sure you want to rotate this API key? The old key will be invalidated instantly, and a new one will be generated.")) {
      rotateMutation.mutate(id);
    }
  };

  const handleCopySecret = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Plaintext API key copied");
  };

  const getAppName = (appId: string | null) => {
    if (!appId) return "Global (All Projects)";
    const app = projects.find(p => p.id === appId);
    return app ? app.name : "Unknown Project";
  };

  return (
    <div className="max-w-[960px] space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">API Keys</h1>
          <p className="text-[13px] text-[rgba(255,255,255,0.38)] mt-1">
            Manage authentication credentials for your applications.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all"
          style={{ background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.25)", color: "#00C2FF" }}>
          <Plus size={13} /> Generate API Key
        </button>
      </motion.div>

      {/* Warning banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
        <AlertTriangle size={14} style={{ color: "#f87171" }} className="mt-0.5 shrink-0" />
        <p className="text-[12px] text-[rgba(255,255,255,0.55)] leading-relaxed">
          <strong className="text-[rgba(248,113,113,0.9)]">Security notice:</strong> API keys grant full administrative database access to your NeoFace integration.
          Store them securely. Never expose secret keys in client-side code, JS bundles, or public repositories.
        </p>
      </motion.div>

      {/* New key modal creation form */}
      {showNew && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="dash-card p-6 rounded-2xl"
          style={{ borderColor: "rgba(0,194,255,0.2)" }}>
          <h3 className="text-[14px] font-semibold text-white mb-4">Create new API key</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[11px] text-[rgba(255,255,255,0.4)] font-medium uppercase tracking-wide block mb-1.5">Key name</label>
              <input
                value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. Production — Mobile App"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="text-[11px] text-[rgba(255,255,255,0.4)] font-medium uppercase tracking-wide block mb-1.5">Project Scope</label>
              <select
                value={selectedAppId} onChange={e => setSelectedAppId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <option value="global">Global (All Projects)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={!newKeyName.trim() || createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-opacity"
              style={{ background: "rgba(0,194,255,0.12)", border: "1px solid rgba(0,194,255,0.25)", color: "#00C2FF", opacity: newKeyName.trim() && !createMutation.isPending ? 1 : 0.4 }}>
              {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
              Generate key
            </button>
            <button onClick={() => setShowNew(false)}
              className="px-4 py-2 rounded-xl text-[12.5px] font-medium text-[rgba(255,255,255,0.35)]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Secret Plaintext Key Modal Overlay */}
      <AnimatePresence>
        {plaintextKey && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg rounded-2xl p-7"
                style={{ background: "rgba(10,10,10,0.98)", border: "1px solid rgba(0,229,168,0.3)", boxShadow: "0 24px 80px rgba(0,229,168,0.1)" }}>
                <div className="flex items-center gap-2 text-[#00E5A8] mb-4">
                  <CheckCircle2 size={18} />
                  <h3 className="text-[15px] font-semibold">API Key Generated Successfully</h3>
                </div>
                <p className="text-[12.5px] text-[rgba(255,255,255,0.6)] leading-relaxed mb-5">
                  This is your full secret key. Copy it now and save it securely.
                  For your security, <strong className="text-white">you will not be able to see it again</strong> after you close this dialog.
                </p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 font-mono text-[13px] text-white"
                  style={{ background: "rgba(0,229,168,0.04)", border: "1px solid rgba(0,229,168,0.2)" }}>
                  <span className="flex-1 truncate select-all">{plaintextKey}</span>
                  <button
                    onClick={() => handleCopySecret(plaintextKey)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#00E5A8]"
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <button
                  onClick={() => setPlaintextKey(null)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-center"
                  style={{ background: "#00E5A8", color: "#000" }}
                >
                  I have saved this key securely
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keys list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[rgba(255,255,255,0.02)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
              <Key className="mx-auto mb-3 opacity-20" size={24} />
              <p className="text-[13px] text-[rgba(255,255,255,0.4)]">No active API keys found</p>
              <button
                onClick={() => setShowNew(true)}
                className="mt-3 text-[11.5px] font-semibold text-[#00C2FF] hover:underline"
              >
                Generate your first key
              </button>
            </div>
          ) : (
            apiKeys.map((key, i) => {
              const appName = getAppName(key.application_id);
              const isActive = key.status === "active";
              
              return (
                <motion.div key={key.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="dash-card rounded-2xl p-5 group"
                >
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: isActive ? "rgba(0,194,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isActive ? "rgba(0,194,255,0.15)" : "rgba(255,255,255,0.05)"}` }}>
                        <Key size={15} style={{ color: isActive ? "#00C2FF" : "rgba(255,255,255,0.3)" }} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-white">{key.name}</p>
                        <p className="text-[10px] text-[rgba(255,255,255,0.28)] font-mono mt-0.5">{key.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wide"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                        {appName}
                      </span>
                      {isActive ? (
                        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "#00E5A8" }}>
                          <span className="status-dot-live shrink-0" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] text-[rgba(255,255,255,0.3)]">
                          ○ Revoked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key preview */}
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "monospace" }}>
                    <Shield size={11} style={{ color: "rgba(255,255,255,0.2)" }} />
                    <span className="text-[12px] text-[rgba(255,255,255,0.45)] flex-1 truncate">
                      {revealId === key.id
                        ? `${key.key_prefix}••••••••••••••••••••••••••••`
                        : `${key.key_prefix}${"•".repeat(28)}`}
                    </span>
                    {isActive && (
                      <>
                        <button onClick={() => setRevealId(revealId === key.id ? null : key.id)}
                          className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors">
                          {revealId === key.id ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(`${key.key_prefix}••••••••••••••••••••••••••••`); toast.success("Key prefix copied"); }}
                          className="text-[rgba(255,255,255,0.3)] hover:text-white transition-colors ml-1">
                          <Copy size={12} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Scope badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {key.scopes.map(s => (
                      <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded-md"
                        style={{
                          background: `${SCOPE_COLORS[s] ?? "#fff"}10`,
                          border: `1px solid ${SCOPE_COLORS[s] ?? "#fff"}18`,
                          color: SCOPE_COLORS[s] ?? "rgba(255,255,255,0.45)",
                        }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Metadata + actions */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-4 text-[10.5px] text-[rgba(255,255,255,0.25)]">
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <>
                          <span>·</span>
                          <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-medium text-[rgba(255,255,255,0.4)] hover:text-white transition-all"
                          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                          disabled={rotateMutation.isPending}
                          onClick={() => handleRotate(key.id)}>
                          <RotateCcw size={10} /> Rotate
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-medium transition-all"
                          style={{ border: "1px solid rgba(248,113,113,0.15)", color: "rgba(248,113,113,0.6)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          disabled={revokeMutation.isPending}
                          onClick={() => handleRevoke(key.id)}>
                          <Trash2 size={10} /> Revoke
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
