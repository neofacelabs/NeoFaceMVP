"use client";

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Download, Shield, AlertTriangle, UserX, Lock, Activity, Eye, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

const severityColors = {
  info: { text: "text-[#38BDF8]", bg: "bg-[#38BDF8]/8", dot: "bg-[#38BDF8]" },
  warning: { text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/8", dot: "bg-[#fbbf24]" },
  critical: { text: "text-[#f87171]", bg: "bg-[#f87171]/8", dot: "bg-[#f87171]" },
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    login: "Admin Login",
    logout: "Admin Logout",
    enrollment_created: "Enrollment Created",
    enrollment_deleted: "Enrollment Deleted",
    member_suspended: "Member Suspended",
    member_reactivated: "Member Reactivated",
    device_added: "Device Added",
    device_removed: "Device Removed",
    policy_updated: "Policy Updated",
    role_changed: "Role Changed",
    bulk_import: "Bulk Import",
  };
  return labels[action] || action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warning" | "critical">("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      const res = await apiClient.get("audit-logs");
      setLogs(res.data.items || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExport = async () => {
    try {
      const res = await apiClient.get("audit-logs/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export audit logs CSV.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const mappedLogs = logs.map((log: any) => {
    const meta = log.metadata_ || {};
    const severity = meta.severity || (log.event_type.includes("deleted") || log.event_type.includes("suspended") ? "warning" : "info");
    return {
      id: log.id,
      action: log.event_type,
      actor_name: meta.actor_name || (log.actor_id ? `User (${log.actor_id.slice(0, 8)})` : "System"),
      actor_role: meta.actor_role || "Administrator",
      target: meta.target || log.entity_type || "N/A",
      details: meta.details || (log.entity_id ? `ID: ${log.entity_id}` : ""),
      ip_address: log.ip_address || "N/A",
      timestamp: log.created_at,
      severity: severity as "info" | "warning" | "critical",
    };
  });

  const filtered = mappedLogs.filter((log) => {
    const matchSearch = search ? log.actor_name.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || log.target.toLowerCase().includes(search.toLowerCase()) : true;
    const matchSev = severityFilter === "all" ? true : log.severity === severityFilter;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Tamper-proof log of all administrative actions across the platform."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Audit Logs" }]}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <KPIGrid columns={4}>
        <KPICard label="Total Events" value={mappedLogs.length} index={0} />
        <KPICard label="Critical Events" value={mappedLogs.filter(l => l.severity === "critical").length} color="error" index={1} />
        <KPICard label="Warnings" value={mappedLogs.filter(l => l.severity === "warning").length} color="warning" index={2} />
        <KPICard label="Unique Actors" value={new Set(mappedLogs.map(l => l.actor_name)).size} index={3} color="accent" />
      </KPIGrid>

      <ChartCard title="Event Log" description="All administrative actions — immutable audit trail" index={0} className="p-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.065] bg-white/[0.02] p-1">
            {(["all", "info", "warning", "critical"] as const).map((s) => (
              <button key={s} onClick={() => setSeverityFilter(s)} className={cn("rounded-md px-3 py-1 text-[11px] font-medium transition-all capitalize", severityFilter === s ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white/60")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target / Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log, i) => {
              const sev = severityColors[log.severity];
              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", sev.bg, sev.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                      {log.severity}
                    </span>
                  </TableCell>
                  <TableCell className="text-[12px] font-medium text-white/75">{getActionLabel(log.action)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-[12px] font-medium text-white/80">{log.actor_name}</p>
                      <p className="text-[10.5px] text-white/30">{log.actor_role}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    {log.target && <p className="text-[11.5px] font-medium text-white/65 truncate">{log.target}</p>}
                    {log.details && <p className="text-[10.5px] text-white/30 truncate">{log.details}</p>}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-white/35">{log.ip_address}</TableCell>
                  <TableCell className="text-[11px] text-white/30 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
