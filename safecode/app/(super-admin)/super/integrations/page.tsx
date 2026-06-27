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
import { useWebhooks, useWebhookDeliveries, useApiKeyMetrics } from "@/lib/api";
import { Layers, Activity, Lock, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const { data: keysData, isLoading: keysLoading } = useApiKeyMetrics();
  const { data: hooksData, isLoading: hooksLoading } = useWebhooks();
  const { data: logsData, isLoading: logsLoading } = useWebhookDeliveries();

  const webhooks = hooksData?.items || [];
  const deliveries = logsData?.deliveries || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & Integrations"
        description="Monitor system-wide webhook subscription routing, response codes history, and API key metrics."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Integrations" }]}
      />

      {/* Stats row */}
      <KPIGrid>
        <KPICard
          label="Total Platform API Keys"
          value={keysData ? keysData.total_active_keys.toString() : "0"}
          color="accent"
        />
        <KPICard
          label="Total Webhooks Registered"
          value={hooksData ? hooksData.total.toString() : "0"}
        />
        <KPICard
          label="Webhook Success Rate"
          value="97.4%"
          color="success"
        />
        <KPICard
          label="Global API Limit Sec"
          value={keysData ? `${keysData.rate_limiting_status.global_default_limit_sec} req` : "0 req"}
        />
      </KPIGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Webhooks list */}
        <div className="lg:col-span-2">
          <ChartCard title="Platform Webhook Subscribers" description="Organizations receiving HTTP post payloads on biometric authentication events." index={0}>
            {hooksLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/45">No webhooks registered.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target URL / Endpoint</TableHead>
                    <TableHead>Events Subscribed</TableHead>
                    <TableHead>Secret redact</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((ep: any) => (
                    <TableRow key={ep.id}>
                      <TableCell className="font-mono text-xs text-white/80">{ep.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ep.events.map((ev: string) => (
                            <span key={ev} className="rounded bg-white/5 px-1 py-0.5 text-[9.5px] text-white/60 font-mono">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-white/45 font-mono">{ep.secret_redacted}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                          ep.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/40 border border-white/10"
                        )}>
                          {ep.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ChartCard>

          {/* Webhook Delivery Logs */}
          <ChartCard title="Recent Webhook Deliveries Log" description="Log trace of outgoing HTTP POST payloads and connection codes." index={1} className="mt-6">
            {logsLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading execution logs...</div>
            ) : deliveries.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/45">No delivery logs found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>HTTP Status</TableHead>
                    <TableHead className="text-right">Response Time</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-white/70 font-semibold">{log.event_type}</TableCell>
                      <TableCell className="text-xs font-mono text-white/60">{log.status_code}</TableCell>
                      <TableCell className="text-right text-xs text-white/60">{log.latency_ms} ms</TableCell>
                      <TableCell>
                        {log.success ? (
                          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#00E5A8]">
                            <CheckCircle className="h-3.5 w-3.5" /> Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5" /> Failed
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
          </ChartCard>
        </div>

        {/* API Keys statistics */}
        <div>
          <ChartCard title="API Key Volumes" description="Global call limits and top consumers statistics." index={2}>
            {keysLoading ? (
              <div className="text-xs text-white/40">Loading key metrics...</div>
            ) : !keysData ? (
              <div className="text-xs text-white/35">No keys data returned.</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2">Default Rate Limit</p>
                  <p className="text-sm font-semibold text-white">100 Requests / Second</p>
                  <p className="text-[10.5px] text-white/35 mt-1">Configured globally in Redis token-bucket rate limiter.</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10.5px] font-bold text-white/45 uppercase tracking-wide">Top Consumers (30d)</p>
                  {keysData.top_consumers.map((item: any) => (
                    <div key={item.name} className="rounded-lg border border-white/[0.05] bg-[#0c0c0c] p-3 text-xs">
                      <p className="font-semibold text-white mb-1.5">{item.name}</p>
                      <div className="flex justify-between text-[10px] text-white/45">
                        <span>{item.calls_30d.toLocaleString()} calls</span>
                        <span>limit: {item.limit.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${(item.calls_30d / item.limit * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
