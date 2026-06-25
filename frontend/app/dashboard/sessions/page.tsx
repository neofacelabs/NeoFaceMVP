"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, CheckCircle2, XCircle, Clock, Search, Filter,
  Shield, Fingerprint, Scan, Eye, AlertTriangle, ArrowUpRight, ChevronDown,
  Loader2, Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface SessionResponse {
  id: string;
  organization_id: string;
  application_id: string;
  identity_id: string | null;
  event_type: string;
  status: string;
  confidence_score: number | null;
  risk_score: number | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  latency_ms: number | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

const SESSION_TYPES = [
  { value: "all",       label: "All Events" },
  { value: "success",   label: "Verified" },
  { value: "failure",   label: "Failed" },
  { value: "liveness",  label: "Liveness" },
];

const TYPE_CFG: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  success:    { icon: CheckCircle2, color: "#00E5A8", label: "Verified",   bg: "rgba(0,229,168,0.08)" },
  failure:    { icon: XCircle,      color: "#f87171", label: "Failed",     bg: "rgba(248,113,113,0.08)" },
  liveness:   { icon: Eye,          color: "#818cf8", label: "Liveness",   bg: "rgba(129,140,248,0.08)" },
  enrollment: { icon: Fingerprint,  color: "#00C2FF", label: "Enrolled",   bg: "rgba(0,194,255,0.08)" },
  other:      { icon: Activity,     color: "rgba(255,255,255,0.4)", label: "Activity", bg: "rgba(255,255,255,0.04)" }
};

function RiskBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-[rgba(255,255,255,0.25)]">—</span>;
  
  const val = Math.round(score * 100);
  const cfg = val >= 70 ? { color: "#f87171", label: "HIGH" }
    : val >= 40 ? { color: "#fbbf24", label: "MED" }
    : { color: "#00E5A8", label: "LOW" };
    
  return (
    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md"
      style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}20` }}>
      {cfg.label} {val}%
    </span>
  );
}

export default function SessionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch real sessions from API
  const { data: sessionsData, isLoading, refetch } = useQuery<{ items: SessionResponse[] }>({
    queryKey: ["sessions-list"],
    queryFn: () => apiClient.get("sessions?page_size=100").then(r => r.data),
    refetchInterval: 10_000, // Poll every 10s for live feel
  });

  // Fetch projects to resolve application_id to name
  const { data: projectsData } = useQuery<{ items: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("projects").then(r => r.data),
  });

  const sessions = sessionsData?.items ?? [];
  const projects = projectsData?.items ?? [];

  const getAppName = (appId: string) => {
    const app = projects.find(p => p.id === appId);
    return app ? app.name : "Unknown Project";
  };

  const getSessionConfig = (s: SessionResponse) => {
    if (s.event_type.includes("liveness")) return TYPE_CFG.liveness;
    if (s.event_type.includes("enroll")) return TYPE_CFG.enrollment;
    if (s.status === "success") return TYPE_CFG.success;
    if (s.status === "failure" || s.status === "failed") return TYPE_CFG.failure;
    return TYPE_CFG.other;
  };

  const filtered = sessions.filter(s => {
    // Type Filter
    let matchesType = true;
    if (typeFilter === "success") {
      matchesType = s.status === "success";
    } else if (typeFilter === "failure") {
      matchesType = s.status === "failure" || s.status === "failed";
    } else if (typeFilter === "liveness") {
      matchesType = s.event_type.includes("liveness");
    }

    // Search filter
    const appName = getAppName(s.application_id).toLowerCase();
    const matchesSearch = !search || 
      s.id.toLowerCase().includes(search.toLowerCase()) || 
      (s.identity_id || "").toLowerCase().includes(search.toLowerCase()) || 
      appName.includes(search.toLowerCase()) ||
      s.event_type.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Totals calculations
  const totalCount = sessions.length;
  const verifiedCount = sessions.filter(s => s.status === "success").length;
  const failedCount = sessions.filter(s => s.status === "failure" || s.status === "failed").length;
  const suspiciousCount = sessions.filter(s => s.risk_score && s.risk_score >= 0.7).length;

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">Authentication Sessions</h1>
          <p className="text-[13px] text-[rgba(255,255,255,0.38)] mt-1">
            Real-time stream of all authentication events across your applications.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.15)", color: "#00E5A8" }}>
          <span className="status-dot-live animate-pulse" /> LIVE
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions",  value: totalCount,  color: "#00C2FF" },
          { label: "Verified",        value: verifiedCount,  color: "#00E5A8" },
          { label: "Failed",          value: failedCount,    color: "#f87171" },
          { label: "Suspicious",      value: suspiciousCount,     color: "#fbbf24" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="dash-card p-4 rounded-2xl">
            <p className="kpi-label mb-2">{s.label}</p>
            <p className="text-[24px] font-bold" style={{ color: s.color }}>
              {isLoading ? "…" : s.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.25)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by session ID, user ID, or app…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12.5px] text-[rgba(255,255,255,0.7)] outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,194,255,0.25)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl p-1"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {SESSION_TYPES.map(t => (
            <button key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: typeFilter === t.value ? "rgba(255,255,255,0.08)" : "transparent",
                color: typeFilter === t.value ? "#fff" : "rgba(255,255,255,0.38)",
                border: typeFilter === t.value ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions table */}
      {isLoading ? (
        <div className="p-8 space-y-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#00C2FF]" size={24} />
          <p className="text-[12px] text-[rgba(255,255,255,0.4)]">Fetching live session stream…</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="dash-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11.5px] text-[rgba(255,255,255,0.35)]">
              Showing {filtered.length} sessions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Session ID</th>
                  <th>User ID</th>
                  <th>Application</th>
                  <th>IP Address</th>
                  <th>Latency</th>
                  <th>Risk</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[12.5px] text-[rgba(255,255,255,0.3)]">
                      No active sessions matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => {
                    const cfg = getSessionConfig(s);
                    const isFace = s.event_type.includes("face");
                    const isIris = s.event_type.includes("iris");
                    
                    return (
                      <motion.tr key={s.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.015 }}>
                        <td>
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                              <cfg.icon size={10} style={{ color: cfg.color }} />
                            </span>
                            <span className="text-[11.5px] font-medium" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </span>
                        </td>
                        <td><span className="font-mono text-[11px] text-[rgba(255,255,255,0.4)]">{s.id.slice(0, 18)}…</span></td>
                        <td><span className="font-mono text-[11px] truncate max-w-[120px] block">{s.identity_id || "Anonymous"}</span></td>
                        <td className="max-w-[140px]"><span className="truncate block text-[11.5px]">{getAppName(s.application_id)}</span></td>
                        <td>
                          <span className="text-[11px] text-[rgba(255,255,255,0.4)] font-mono">
                            {s.ip_address || "127.0.0.1"}
                          </span>
                        </td>
                        <td><span className="font-mono text-[11px]">{s.latency_ms ? `${s.latency_ms}ms` : "—"}</span></td>
                        <td><RiskBadge score={s.risk_score} /></td>
                        <td>
                          <span className="text-[11px] text-[rgba(255,255,255,0.4)]">
                            {new Date(s.created_at).toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
