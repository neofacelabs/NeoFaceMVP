"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { useAuthLogs, useAuthStats } from "@/lib/api/authentication";
import { ZapIcon, Clock, CheckCircle2, XCircle, Search, AlertCircle, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AuthenticationLogsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data: logsData, isLoading } = useAuthLogs(page, 20, undefined, statusFilter);
  const { data: statsData } = useAuthStats(30);
  
  // Real-time live feed via WebSocket
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  
  useEffect(() => {
    const wsUrl = `ws://${window.location.host.replace("3000", "8000")}/api/v1/ws/events`;
    const socket = new WebSocket(wsUrl);
    
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "auth_event") {
          setLiveEvents((prev) => [payload.data, ...prev].slice(0, 10));
        }
      } catch (err) {
        console.error("Failed to parse websocket message:", err);
      }
    };
    
    return () => socket.close();
  }, []);

  const logs = logsData?.items || [];
  const stats = statsData || {
    total_authentications: 0,
    successful_authentications: 0,
    failed_authentications: 0,
    success_rate: 0,
    average_latency_ms: 0,
    device_distribution: { face_camera: 0, fingerprint_reader: 0, iris_scanner: 0 }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authentication Logs"
        description="Monitor real-time biometric access events, spoof logs, and multi-factor validation sessions."
        breadcrumbs={[{ label: "Organization" }, { label: "Authentication" }]}
      />

      <KPIGrid columns={4}>
        {[
          { label: "Successful Verifications", value: stats.successful_authentications, color: "success" as const },
          { label: "Failed Attempts", value: stats.failed_authentications, color: "warning" as const },
          { label: "Overall Success Rate", value: `${stats.success_rate.toFixed(1)}%` },
          { label: "Avg Matching Latency", value: `${stats.average_latency_ms}ms`, sub_label: "Liveness + Matching" }
        ].map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i} />)}
      </KPIGrid>

      {/* Live Stream Panel */}
      <div className="rounded-[14px] border border-white/[0.065] bg-black/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <h2 className="text-sm font-semibold text-white/90">Live Activity Feed</h2>
          </div>
          <span className="text-[10px] text-white/30">Listening to events...</span>
        </div>
        
        {liveEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-white/20">
            Waiting for biometric verifications...
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {liveEvents.map((evt) => (
              <div key={evt.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${evt.success ? "bg-emerald-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-xs font-semibold text-white/80">{evt.external_user_id} - <span className="capitalize">{evt.method}</span></p>
                    <p className="text-[10px] text-white/30">IP: {evt.ip_address} | Confidence: {Math.round(evt.confidence * 100)}%</p>
                  </div>
                </div>
                <div className="text-right">
                  {evt.success ? (
                    <span className="text-[10px] font-semibold text-emerald-400">PASSED</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-red-400">FAILED</span>
                  )}
                  <p className="text-[9px] text-white/20">{new Date(evt.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Query Filters */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4">
        <select
          value={statusFilter === undefined ? "" : String(statusFilter)}
          onChange={(e) => {
            const val = e.target.value;
            setStatusFilter(val === "" ? undefined : val === "true");
          }}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Verification Results</option>
          <option value="true">Successes</option>
          <option value="false">Failures</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <ZapIcon className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No historical authentication records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-white/[0.065] bg-white/[0.015]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02] text-white/45">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Success</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">IP Address</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.map((log: any) => (
                <tr key={log.id} className="text-white/70 hover:bg-white/[0.01] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-white/80">{log.user_name}</p>
                      <p className="text-[10px] text-white/35">{log.user_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{log.method}</td>
                  <td className="px-4 py-3">
                    <span className={log.success ? "text-emerald-400" : "text-rose-400"}>
                      {log.success ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{(log.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3">{log.ip_address}</td>
                  <td className="px-4 py-3 text-white/40">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
