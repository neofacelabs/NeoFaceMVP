"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Layers, Key, Plus, Trash2, Check, Copy, ExternalLink, Loader2, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function OrganizationIntegrationsPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog configurations
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState(false);

  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [submittingWebhook, setSubmittingWebhook] = useState(false);

  async function loadIntegrationsData() {
    try {
      setLoading(true);
      const [keysRes, hooksRes] = await Promise.all([
        apiClient.get("api-keys"),
        apiClient.get("webhooks")
      ]);
      setApiKeys(keysRes.data?.items || []);
      setWebhooks(hooksRes.data?.items || []);
    } catch (err) {
      console.error("Failed to load integrations metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIntegrationsData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    try {
      setSubmittingKey(true);
      const { data } = await apiClient.post("api-keys", { name: keyName, scopes: ["identity:read", "identity:write", "session:read"] });
      setCreatedKey(data.plaintext_key);
      toast.success("API Key successfully generated!");
      loadIntegrationsData();
    } catch {
      toast.error("Failed to generate API key.");
    } finally {
      setSubmittingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? Immediate server authentication failures will occur for this credential.")) {
      try {
        await apiClient.delete(`api-keys/${id}`);
        toast.success("API key revoked.");
        loadIntegrationsData();
      } catch {
        toast.error("Failed to revoke key.");
      }
    }
  };

  const handlePauseKey = async (id: string) => {
    try {
      await apiClient.post(`api-keys/${id}/pause`);
      toast.success("API key paused.");
      loadIntegrationsData();
    } catch {
      toast.error("Failed to pause key.");
    }
  };

  const handleResumeKey = async (id: string) => {
    try {
      await apiClient.post(`api-keys/${id}/resume`);
      toast.success("API key resumed.");
      loadIntegrationsData();
    } catch {
      toast.error("Failed to resume key.");
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    try {
      setSubmittingWebhook(true);
      await apiClient.post("webhooks", { url: webhookUrl, events: ["auth.success", "auth.fail", "enrollment.complete"] });
      toast.success("Webhook endpoint registered successfully!");
      setWebhookUrl("");
      setIsWebhookOpen(false);
      loadIntegrationsData();
    } catch {
      toast.error("Failed to register webhook.");
    } finally {
      setSubmittingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Are you sure you want to delete this webhook subscription?")) {
      try {
        await apiClient.delete(`webhooks/${id}`);
        toast.success("Webhook subscription deleted.");
        loadIntegrationsData();
      } catch {
        toast.error("Failed to delete webhook.");
      }
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      toast.success("API Key copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Integrations"
        description="Provision programmatic API keys, subscribe to WebSocket events, and register Webhook endpoints."
        breadcrumbs={[{ label: "Organization" }, { label: "API & Integrations" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* API Keys */}
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <Key className="h-4 w-4 text-[#00E5A8]" />
              Programmatic API Credentials
            </h3>
            <Dialog open={isKeyOpen} onOpenChange={(open: boolean) => {
              setIsKeyOpen(open);
              if (!open) {
                setCreatedKey(null);
                setKeyName("");
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1 text-[11px] font-semibold">
                  <Plus className="h-3 w-3" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-white/90">Generate API Key</DialogTitle>
                </DialogHeader>
                {createdKey ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-amber-400 font-medium">
                      Make sure to copy this key now. It will NOT be shown again!
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] p-3 border border-white/[0.08]">
                      <code className="text-xs text-white/80 select-all break-all flex-1">{createdKey}</code>
                      <Button size="sm" onClick={handleCopyKey} className="h-8 w-8 p-0 shrink-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button size="sm" onClick={() => setIsKeyOpen(false)}>
                        Done
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-white/40">Credential Description / App</label>
                      <input
                        type="text"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="e.g. Jenkins CI, Backend Gateway"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsKeyOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={submittingKey}>
                        {submittingKey && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                        Generate
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8]" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/20">
              No API keys generated.
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white/80">{key.name}</p>
                      {key.status === "active" && (
                        <span className="rounded bg-[#00E5A8]/10 border border-[#00E5A8]/15 px-1 py-0.5 text-[9px] text-[#00E5A8]">Live</span>
                      )}
                      {key.status === "paused" && (
                        <span className="rounded bg-amber-500/10 border border-amber-500/15 px-1 py-0.5 text-[9px] text-amber-400">Paused</span>
                      )}
                      {key.status === "revoked" && (
                        <span className="rounded bg-white/5 border border-white/10 px-1 py-0.5 text-[9px] text-white/40">Revoked</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/35 mt-0.5">Prefix: <code className="text-white/50">{key.key_prefix}</code></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {key.status === "active" && (
                      <button
                        onClick={() => handlePauseKey(key.id)}
                        title="Pause API Key"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                      >
                        <Pause className="h-3 w-3" />
                      </button>
                    )}
                    {key.status === "paused" && (
                      <button
                        onClick={() => handleResumeKey(key.id)}
                        title="Resume API Key"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-[#00E5A8]/10 hover:text-[#00E5A8] transition-colors"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                    )}
                    {key.status !== "revoked" && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        title="Revoke / Delete API Key"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Webhooks */}
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#00E5A8]" />
              Event Webhook Handlers
            </h3>
            <Dialog open={isWebhookOpen} onOpenChange={setIsWebhookOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 gap-1 text-[11px] font-semibold">
                  <Plus className="h-3 w-3" />
                  Register Endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-white/90">Register Webhook Endpoint</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWebhook} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-white/40">Destination HTTPS URL</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://api.yourdomain.com/webhooks/neoface"
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsWebhookOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={submittingWebhook}>
                      {submittingWebhook && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                      Register
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8]" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/20">
              No webhook endpoints registered.
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((hook) => (
                <div key={hook.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  <div className="max-w-[80%]">
                    <p className="text-xs font-semibold text-white/80 truncate">{hook.url}</p>
                    <p className="text-[10px] text-white/35">Events: {hook.events.join(", ")} | Status: {hook.status}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWebhook(hook.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
