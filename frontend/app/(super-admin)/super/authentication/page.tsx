"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStats, useAuthLogs } from "@/lib/api";
import { Search, Flame, ShieldAlert, Wifi, Zap, Clock, ShieldCheck } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function AuthenticationMonitorPage() {
  const [wsLogs, setWsLogs] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<"live" | "history">("live");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<boolean | undefined>(undefined);

  const { data: stats, isLoading: statsLoading } = useAuthStats(30);
  const { data: logData, isLoading: logsLoading } = useAuthLogs(page, 30, undefined, statusFilter);

  // Set up live WebSocket auth logs stream
  React.useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_API_BASE_URL
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/^https?:\/\//, "")
      : "localhost:8000";
    
    const ws = new WebSocket(`${protocol}//${host}/api/admin/authentication/ws`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "auth_event") {
          setWsLogs((prev) => [payload.data, ...prev.slice(0, 49)]); // keep last 50 logs
        }
      } catch (err) {
        console.error("Failed to parse WebSocket frame:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const historyLogs = logData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authentication"
        description="Real-time verification event pipeline stream, threat detection logs, and performance metrics."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Authentication" }]}
      />

      {/* Stats Cards */}
      <KPIGrid>
        <KPICard
          label="Verification Success Rate"
          value={stats ? `${stats.success_rate}%` : "0%"}
          trend={0.2}
          trend_direction="up"
          color="success"
        />
        <KPICard
          label="Total Requests (30d)"
          value={stats ? stats.total_authentications.toLocaleString() : "0"}
          trend={14.8}
          trend_direction="up"
        />
        <KPICard
          label="Average API Latency"
          value={stats ? `${stats.average_latency_ms} ms` : "0 ms"}
          color="accent"
        />
        <KPICard
          label="Liveness Spoof Attempts"
          value={stats ? stats.spoof_attempts.toString() : "0"}
          color={stats?.spoof_attempts > 0 ? "warning" : "default"}
        />
      </KPIGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Platform Load distribution" description="Hourly authentication request volume load over peak times." index={0}>
          <div className="h-[220px] w-full">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Object.entries(stats.peak_hours).map(([hour, val]) => ({ hour, requests: val }))}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5A8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#00E5A8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)" }} />
                  <Area type="monotone" dataKey="requests" stroke="#00E5A8" fillOpacity={1} fill="url(#colorRequests)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Biometric Modality Mix" description="Usage ratio between Face recognition and Passkey/Fingerprint verification." index={1}>
          <div className="h-[220px] w-full">
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(stats.device_distribution).map(([name, val]) => ({ name: name.replace("_", " "), volume: val }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)" }} />
                  <Bar dataKey="volume" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Stream Tabs */}
      <div className="flex border-b border-white/[0.07] bg-white/[0.01] p-1 rounded-t-lg">
        <button
          onClick={() => setActiveTab("live")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all",
            activeTab === "live" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          <Wifi className={cn("h-3.5 w-3.5", activeTab === "live" && "text-[#00E5A8] animate-pulse")} />
          Live Auth Stream
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all",
            activeTab === "history" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          <Clock className="h-3.5 w-3.5 text-sky-400" />
          Historic Log Explorer
        </button>
      </div>

      <ChartCard
        title={activeTab === "live" ? "Live Authentication pipeline Feed" : "Historic Log Explorer"}
        description={activeTab === "live" ? "Real-time verification request stack streaming directly from FastAPI WebSockets." : "Filter, query, and trace past biometric session details."}
        index={0}
      >
        {activeTab === "live" ? (
          wsLogs.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center text-sm text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A8] animate-ping mb-2" />
              Waiting for live biometric verification events...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User / Identity</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {wsLogs.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -15, backgroundColor: "rgba(0, 229, 168, 0.08)" }}
                        animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="border-b border-white/[0.05] hover:bg-white/[0.02]"
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-white">{log.user_name}</p>
                            <p className="text-[10px] text-white/40">{log.user_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-white/70 capitalize">{log.method}</TableCell>
                        <TableCell className="text-xs font-semibold text-white">{(log.confidence * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-xs font-medium text-white/60">{log.latency} ms</TableCell>
                        <TableCell className="text-xs text-white/60">{log.ip_address}</TableCell>
                        <TableCell>
                          {log.success ? (
                            <span className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-400">
                              <ShieldCheck className="h-3.5 w-3.5" /> Passed
                            </span>
                          ) : (
                            <span className="flex flex-col text-[10px]">
                              <span className="flex items-center gap-1 font-semibold text-red-400">
                                <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                              </span>
                              <span className="text-[8.5px] text-white/35">{log.failure_reason}</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-white/45">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div>
            <div className="mb-4 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit logs..."
                className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
              />
              <select
                value={statusFilter === undefined ? "" : String(statusFilter)}
                onChange={(e) => setStatusFilter(e.target.value === "" ? undefined : e.target.value === "true")}
                className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/75 focus:outline-none"
              >
                <option value="">All Verification Results</option>
                <option value="true">Succeeded</option>
                <option value="false">Failed</option>
              </select>
            </div>

            {logsLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading history...</div>
            ) : historyLogs.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">No verification sessions found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User / ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Verification Result</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLogs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white">{log.user_name}</p>
                          <p className="text-[10px] text-white/40">{log.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-white/70 capitalize">{log.method}</TableCell>
                      <TableCell className="text-xs font-semibold text-white">{(log.confidence * 100).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-white/60">{log.ip_address}</TableCell>
                      <TableCell>
                        {log.success ? (
                          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#00E5A8]">
                            <ShieldCheck className="h-3.5 w-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="flex flex-col text-[10px]">
                            <span className="flex items-center gap-1 font-semibold text-red-400">
                              <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                            </span>
                            <span className="text-[8.5px] text-white/35">{log.failure_reason}</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-white/45">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
