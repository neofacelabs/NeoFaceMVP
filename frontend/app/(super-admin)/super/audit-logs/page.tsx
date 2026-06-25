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
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Download, Shield, AlertTriangle, UserX, Lock, Activity, Eye } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

type AuditAction =
  | "login"
  | "logout"
  | "enrollment_created"
  | "enrollment_deleted"
  | "member_suspended"
  | "member_reactivated"
  | "device_added"
  | "device_removed"
  | "policy_updated"
  | "role_changed"
  | "bulk_import";

interface AuditEntry {
  id: string;
  action: AuditAction;
  actor_name: string;
  actor_role: string;
  target?: string;
  details?: string;
  ip_address: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

const mockAuditLogs: AuditEntry[] = [
  { id: "a1", action: "bulk_import", actor_name: "Dr. Riya Nair", actor_role: "Org Admin", target: "847 students", details: "CSV import completed successfully", ip_address: "10.0.1.45", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), severity: "info" },
  { id: "a2", action: "policy_updated", actor_name: "Arjun Khanna", actor_role: "Super Admin", target: "Liveness threshold", details: "Liveness score threshold updated from 70% to 80%", ip_address: "203.88.12.9", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), severity: "warning" },
  { id: "a3", action: "member_suspended", actor_name: "Dr. Riya Nair", actor_role: "Org Admin", target: "Suresh Kumar (2021CS10092)", details: "Repeated failed auth attempts — security hold", ip_address: "10.0.1.45", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), severity: "critical" },
  { id: "a4", action: "device_added", actor_name: "Ankit Shah", actor_role: "Tech Admin", target: "Gate Camera B9 (S/N: NCF-2024-0291)", details: "New face camera deployed at Hostel Gate 4", ip_address: "10.0.2.12", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), severity: "info" },
  { id: "a5", action: "enrollment_deleted", actor_name: "Dr. Riya Nair", actor_role: "Org Admin", target: "Priya Mehta (2022EE10045)", details: "Biometric data deleted on member request (GDPR)", ip_address: "10.0.1.45", timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), severity: "warning" },
  { id: "a6", action: "role_changed", actor_name: "Arjun Khanna", actor_role: "Super Admin", target: "Prof. Rajesh Kumar", details: "Role changed from Member to Faculty Admin", ip_address: "203.88.12.9", timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), severity: "info" },
  { id: "a7", action: "login", actor_name: "Dr. Riya Nair", actor_role: "Org Admin", details: "Admin panel login from new device", ip_address: "10.0.1.45", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), severity: "info" },
  { id: "a8", action: "enrollment_created", actor_name: "Enrollment Kiosk", actor_role: "Device", target: "Rahul Sharma (2023CS10201)", details: "Face + fingerprint enrolled at Lab 204 kiosk", ip_address: "10.0.3.8", timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), severity: "info" },
];

const severityColors = {
  info: { text: "text-[#38BDF8]", bg: "bg-[#38BDF8]/8", dot: "bg-[#38BDF8]" },
  warning: { text: "text-[#fbbf24]", bg: "bg-[#fbbf24]/8", dot: "bg-[#fbbf24]" },
  critical: { text: "text-[#f87171]", bg: "bg-[#f87171]/8", dot: "bg-[#f87171]" },
};

const actionLabels: Record<AuditAction, string> = {
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

export default function AuditLogsPage() {
  const [search, setSearch] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<"all" | "info" | "warning" | "critical">("all");

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch = search ? log.actor_name.toLowerCase().includes(search.toLowerCase()) || log.action.includes(search.toLowerCase()) || (log.target ?? "").toLowerCase().includes(search.toLowerCase()) : true;
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
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <KPIGrid columns={4}>
        <KPICard label="Total Events (24h)" value={mockAuditLogs.length} index={0} />
        <KPICard label="Critical Events" value={mockAuditLogs.filter(l => l.severity === "critical").length} color="error" index={1} />
        <KPICard label="Warnings" value={mockAuditLogs.filter(l => l.severity === "warning").length} color="warning" index={2} />
        <KPICard label="Unique Actors" value={new Set(mockAuditLogs.map(l => l.actor_name)).size} index={3} color="accent" />
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
                  <TableCell className="text-[12px] font-medium text-white/75">{actionLabels[log.action]}</TableCell>
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
