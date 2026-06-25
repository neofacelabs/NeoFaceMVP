"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Webhook, Plus, CheckCircle2, XCircle, Clock, Copy, RotateCcw,
  Trash2, ChevronRight, X, AlertTriangle, Key, ExternalLink
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const EVENT_TYPES = [
  "identity.enrolled", "identity.verified",
  "liveness.passed", "liveness.failed",
  "session.created", "session.failed",
  "api_key.created", "api_key.rotated"
];

interface WebhookEndpoint {
  id: string;
  organization_id: string;
  application_id: string | null;
  url: string;
  events: string[];
  status: string;
  created_at: string;
  signing_secret?: string; // Mock secret prefix if not returned
}

interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: string;
  status: string;
  http_status: number | null;
  attempts: number;
  next_retry_at: string | null;
  created_at: string;
}

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);

  // Load Webhooks
  const { data: webhooksData, isLoading, refetch } = useQuery<{ items: WebhookEndpoint[] }>({
    queryKey: ["webhooks"],
    queryFn: () => apiClient.get("webhooks").then(r => r.data),
  });

  const webhooks = webhooksData?.items ?? [];

  // Load Deliveries for selected webhook
  const { data: deliveriesData, isLoading: isLoadingDeliveries } = useQuery<{ items: WebhookDelivery[] }>({
    queryKey: ["webhook-deliveries", selectedWebhook?.id],
    queryFn: () => {
      if (!selectedWebhook) return { items: [] };
      return apiClient.get(`webhooks/${selectedWebhook.id}/deliveries`).then(r => r.data);
    },
    enabled: !!selectedWebhook,
    refetchInterval: selectedWebhook ? 8000 : false, // Poll deliveries when inspected
  });

  const deliveries = deliveriesData?.items ?? [];

  // Create Webhook endpoint
  const createMutation = useMutation({
    mutationFn: (data: { url: string; events: string[] }) => apiClient.post("webhooks", data),
    onSuccess: () => {
      toast.success("Webhook endpoint registered successfully");
      setShowNew(false);
      setNewUrl("");
      setSelectedEvents([]);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Failed to create webhook";
      toast.error(msg);
    }
  });

  // Delete Webhook endpoint
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`webhooks/${id}`),
    onSuccess: () => {
      toast.success("Webhook endpoint deleted");
      if (selectedWebhook?.id) setSelectedWebhook(null);
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: () => {
      toast.error("Failed to delete webhook endpoint");
    }
  });

  // Send Test Webhook
  const testMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`webhooks/${id}/test`),
    onSuccess: () => {
      toast.success("Test ping event queued");
      queryClient.invalidateQueries({ queryKey: ["webhook-deliveries"] });
    },
    onError: () => {
      toast.error("Failed to send test webhook");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newUrl.startsWith("http")) {
      toast.error("Please enter a valid URL (starting with http/https)");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event type");
      return;
    }
    createMutation.mutate({ url: newUrl, events: selectedEvents });
  };

  const handleToggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const handleCopySecret = (id: string) => {
    navigator.clipboard.writeText(`whsec_${id.replace(/-/g, "")}`);
    toast.success("Signing secret copied");
  };

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Webhooks</h1>
          <p className="text-[13px] text-[rgba(255,255,255,0.38)] mt-1">
            Configure destination URLs to stream real-time identity & risk events directly to your servers.
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all"
          style={{ background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.25)", color: "#00C2FF" }}>
          <Plus size={13} /> Add Endpoint
        </button>
      </motion.div>

      {/* New endpoint form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="dash-card p-6 rounded-2xl overflow-hidden"
            style={{ borderColor: "rgba(0,194,255,0.2)" }}>
            <h3 className="text-[14px] font-semibold text-white mb-4">Add Webhook Endpoint</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wide block mb-1.5">Endpoint URL</label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://your-api.com/webhooks/neoface"
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wide block mb-1.5">Events to Subscribe</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map(ev => {
                    const isChecked = selectedEvents.includes(ev);
                    return (
                      <label key={ev} onClick={() => handleToggleEvent(ev)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all select-none"
                        style={{
                          background: isChecked ? "rgba(0,194,255,0.08)" : "rgba(255,255,255,0.02)",
                          border: isChecked ? "1px solid rgba(0,194,255,0.25)" : "1px solid rgba(255,255,255,0.05)",
                          color: isChecked ? "#00C2FF" : "rgba(255,255,255,0.45)"
                        }}>
                        <input type="checkbox" checked={isChecked} readOnly className="hidden" />
                        {ev}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold"
                  style={{ background: "#00C2FF", color: "#000" }}>
                  {createMutation.isPending ? "Registering..." : "Create Endpoint"}
                </button>
                <button type="button" onClick={() => setShowNew(false)}
                  className="px-4 py-2 rounded-xl text-[12.5px] text-[rgba(255,255,255,0.35)]"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Endpoint list */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(2)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-[rgba(255,255,255,0.02)] animate-pulse border border-[rgba(255,255,255,0.05)]" />)
        ) : webhooks.length === 0 ? (
          <div className="dash-card p-10 text-center rounded-2xl bg-[rgba(255,255,255,0.015)] border-[rgba(255,255,255,0.05)]">
            <Webhook size={28} className="mx-auto mb-2 text-[rgba(255,255,255,0.15)]" />
            <p className="text-[13.5px] font-semibold text-white">No webhooks registered</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.3)] mt-0.5">Click "Add Endpoint" above to configure your first destination.</p>
          </div>
        ) : (
          webhooks.map((wh) => (
            <motion.div key={wh.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="dash-card rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.015)] border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[rgba(0,194,255,0.08)] border border-[rgba(0,194,255,0.15)]">
                    <Webhook size={13} style={{ color: "#00C2FF" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white font-mono">{wh.url}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.28)] mt-0.5">Created on {new Date(wh.created_at).toLocaleDateString()} · Status: {wh.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10.5px]">
                    {wh.status === "active"
                      ? <><span className="status-dot-live" /><span style={{ color: "#00E5A8" }}>Active</span></>
                      : <><span className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]" /><span className="text-[rgba(255,255,255,0.3)]">Disabled</span></>}
                  </span>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] text-[rgba(255,255,255,0.35)] hover:text-white transition-all bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]"
                    onClick={() => testMutation.mutate(wh.id)}>
                    Send Test
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] text-[rgba(0,194,255,0.7)] hover:text-[#00C2FF] transition-all bg-[rgba(0,194,255,0.05)] border border-[rgba(0,194,255,0.15)]"
                    onClick={() => setSelectedWebhook(wh)}>
                    Deliveries
                  </button>
                  <button className="p-1.5 rounded-lg text-[rgba(248,113,113,0.5)] hover:text-[#f87171] transition-all bg-[rgba(248,113,113,0.03)] border border-[rgba(248,113,113,0.1)]"
                    onClick={() => deleteMutation.mutate(wh.id)}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Events subscribed */}
                <div>
                  <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-1.5">Subscribed Events</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map(ev => (
                      <span key={ev} className="text-[10px] px-2 py-0.5 rounded-md font-mono"
                        style={{ background: "rgba(0,194,255,0.06)", border: "1px solid rgba(0,194,255,0.12)", color: "#00C2FF" }}>
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Signing secret */}
                <div className="flex items-center gap-2 pt-1 border-t border-[rgba(255,255,255,0.02)]">
                  <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-wider">Signing Secret:</p>
                  <span className="text-[11.5px] font-mono text-[rgba(255,255,255,0.4)]">
                    whsec_{wh.id.replace(/-/g, "").slice(0, 16)}••••••••
                  </span>
                  <button onClick={() => handleCopySecret(wh.id)} className="text-[rgba(255,255,255,0.25)] hover:text-white transition-colors">
                    <Copy size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Inspect Deliveries Modal */}
      <AnimatePresence>
        {selectedWebhook && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedWebhook(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-3xl rounded-2xl p-6 pointer-events-auto flex flex-col max-h-[85vh] bg-[rgba(8,8,8,0.98)] border border-[rgba(255,255,255,0.08)] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)] mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-white">Webhook Delivery Attempts</h3>
                    <p className="text-[11px] text-[rgba(255,255,255,0.45)] mt-0.5 font-mono">{selectedWebhook.url}</p>
                  </div>
                  <button onClick={() => setSelectedWebhook(null)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.04)]">
                    <X size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                  {isLoadingDeliveries ? (
                    <div className="space-y-2 p-2">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-[rgba(255,255,255,0.02)] animate-pulse" />)}
                    </div>
                  ) : deliveries.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock size={20} className="mx-auto mb-2 text-[rgba(255,255,255,0.15)]" />
                      <p className="text-[13px] text-white font-medium">No deliveries logged</p>
                      <p className="text-[11.5px] text-[rgba(255,255,255,0.3)] mt-0.5">Test deliveries and triggered events will appear here.</p>
                    </div>
                  ) : (
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Event Type</th>
                          <th>HTTP Status</th>
                          <th>Attempts</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map(d => (
                          <tr key={d.id}>
                            <td>
                              {d.status === "success" || d.status === "delivered" ? (
                                <span className="flex items-center gap-1.5 text-[#00E5A8] text-[11.5px]"><CheckCircle2 size={12} /> Success</span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[#f87171] text-[11.5px]"><XCircle size={12} /> Failed</span>
                              )}
                            </td>
                            <td><span className="font-mono text-[11px]">{d.event_type}</span></td>
                            <td>
                              <span className="font-mono text-[11.5px] px-1.5 py-0.5 rounded"
                                style={{
                                  background: d.http_status && d.http_status < 300 ? "rgba(0,229,168,0.08)" : "rgba(248,113,113,0.08)",
                                  color: d.http_status && d.http_status < 300 ? "#00E5A8" : "#f87171"
                                }}>
                                {d.http_status || "—"}
                              </span>
                            </td>
                            <td><span className="text-[12px] text-[rgba(255,255,255,0.4)]">{d.attempts}</span></td>
                            <td><span className="text-[11px] text-[rgba(255,255,255,0.3)]">{new Date(d.created_at).toLocaleString()}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
                  <button onClick={() => setSelectedWebhook(null)}
                    className="px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
