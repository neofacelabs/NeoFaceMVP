"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  Loader2,
  Clock,
  MapPin,
  Fingerprint,
  Camera,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { authApi, dashboardApi } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

function safeFormatDistanceToNow(dateVal: any): string {
  if (!dateVal) return "recently";
  let parsedVal = dateVal;
  if (dateVal && typeof dateVal === "object") {
    if (typeof dateVal.seconds === "number") {
      parsedVal = dateVal.seconds * 1000;
    } else if (typeof dateVal._seconds === "number") {
      parsedVal = dateVal._seconds * 1000;
    }
  }
  try {
    const d = new Date(parsedVal);
    if (isNaN(d.getTime())) return "recently";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (err) {
    return "recently";
  }
}

function safeFormatDate(dateVal: any): string {
  if (!dateVal) return "N/A";
  let parsedVal = dateVal;
  if (dateVal && typeof dateVal === "object") {
    if (typeof dateVal.seconds === "number") {
      parsedVal = dateVal.seconds * 1000;
    } else if (typeof dateVal._seconds === "number") {
      parsedVal = dateVal._seconds * 1000;
    }
  }
  try {
    const d = new Date(parsedVal);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "MMM d, yyyy h:mm a");
  } catch (err) {
    return "N/A";
  }
}

export default function MemberAuthHistoryPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "success" | "failed">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "face" | "fingerprint" | "web">("all");
  
  // Selection details modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, logsRes] = await Promise.all([
          axios.get("/api/member/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
          }).catch((err) => {
            console.warn("Failed to fetch local member profile, falling back to backend me():", err);
            return authApi.me();
          }),
          dashboardApi.getLogs(1, 150).catch(() => ({ data: { logs: [] } })),
        ]);
        
        const userProfile = meRes.data;
        setProfile(userProfile);
        
        const allLogs = logsRes.data?.logs || [];
        const userLogs = allLogs.filter((l: any) => l.user_id === userProfile.id || l.user_id === userProfile.uid);
        setLogs(userLogs);
      } catch (err) {
        console.error("Failed to load audit history:", err);
        toast.error("Failed to retrieve authentication history.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export.");
      return;
    }
    
    try {
      const headers = ["Log ID", "Timestamp", "Method", "Zone/Location", "Confidence Score", "Liveness Score", "Result", "IP Address"];
      const rows = filteredLogs.map(l => [
        l.id,
        safeFormatDate(l.timestamp),
        l.method.toUpperCase(),
        l.zone,
        l.confidence ? `${l.confidence.toFixed(1)}%` : "N/A",
        l.liveness ? `${l.liveness.toFixed(1)}%` : "N/A",
        l.result.toUpperCase(),
        l.ip_address || "N/A"
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `neoface-auth-history-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV export.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  // Map to local UI properties
  const mappedLogs = logs.map((log: any) => {
    const isFace = !!(log.confidence_score || log.action?.includes("face") || log.method === "face");
    const isFingerprint = !!(log.action?.includes("fingerprint") || log.method === "fingerprint");
    const isSuccess = log.authentication_result === true || log.result === "success" || log.status === "success" || log.action?.includes("success");
    
    let method = "web";
    if (isFace) method = "face";
    else if (isFingerprint) method = "fingerprint";
    
    return {
      id: log.id,
      result: (isSuccess ? "success" : "failed") as "success" | "failed",
      method,
      zone: log.ip_address || "Web Portal",
      timestamp: log.timestamp || log.created_at,
      confidence: log.confidence_score ? log.confidence_score * 100 : undefined,
      liveness: log.liveness_score ? log.liveness_score * 100 : undefined,
      ip_address: log.ip_address || "127.0.0.1",
      raw: log
    };
  });

  // Filter logs
  const filteredLogs = mappedLogs.filter((log) => {
    const matchesSearch = search
      ? log.zone.toLowerCase().includes(search.toLowerCase()) ||
        log.ip_address.toLowerCase().includes(search.toLowerCase()) ||
        log.id.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesResult = resultFilter === "all" ? true : log.result === resultFilter;
    const matchesMethod = methodFilter === "all" ? true : log.method === methodFilter;

    return matchesSearch && matchesResult && matchesMethod;
  });

  const totalAttempts = filteredLogs.length;
  const successfulAttempts = filteredLogs.filter(l => l.result === "success").length;
  const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 100;
  const uniqueZones = new Set(filteredLogs.map(l => l.zone)).size;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "face":
        return <Camera className="h-4 w-4 text-[#00E5A8]" />;
      case "fingerprint":
        return <Fingerprint className="h-4 w-4 text-[#38BDF8]" />;
      default:
        return <Laptop className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auth History"
        description="Detailed record of your biometric and portal authentication sessions."
        breadcrumbs={[
          { label: "Member Portal", href: "/me" },
          { label: "Auth History" }
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        }
      />

      <KPIGrid columns={3}>
        <KPICard label="Authentication Sessions" value={totalAttempts} index={0} />
        <KPICard
          label="Verification Success Rate"
          value={`${successRate.toFixed(1)}%`}
          index={1}
          color={successRate > 90 ? "success" : successRate > 75 ? "warning" : "error"}
        />
        <KPICard label="Authorized Access Locations" value={uniqueZones} index={2} color="accent" />
      </KPIGrid>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search by zone, IP, or Log ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white/[0.02] border-white/10 text-white placeholder-white/30 text-xs rounded-lg focus:border-[#00E5A8]/30"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Result Filter */}
          <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.05]">
            {(["all", "success", "failed"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setResultFilter(r)}
                className={cn(
                  "px-3 py-1 text-[10.5px] font-medium rounded-md capitalize transition-all",
                  resultFilter === r
                    ? "bg-[#00E5A8]/15 text-[#00E5A8] border border-[#00E5A8]/20"
                    : "text-white/40 hover:text-white/70 border border-transparent"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Method Filter */}
          <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.05]">
            {(["all", "face", "fingerprint", "web"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={cn(
                  "px-3 py-1 text-[10.5px] font-medium rounded-md capitalize transition-all",
                  methodFilter === m
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <ChartCard
        title="Authentication Audit Log"
        description="Immutable logs of validation checks against your digital identity"
        index={0}
        className="p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/[0.01] border-b border-white/[0.05]">
              <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10 pl-6">Session ID</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10">Method</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10">Access Zone / Portal</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10">Time</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10">Match Score</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10">Status</TableHead>
                <TableHead className="text-white/40 text-[11px] uppercase tracking-wider font-semibold py-3 h-10 pr-6 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-[12px] text-white/30">
                    No matching authentication attempts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors cursor-pointer group"
                  >
                    <TableCell className="font-mono text-[11px] text-white/60 py-3.5 pl-6 max-w-[120px] truncate">
                      {log.id}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-white/80 capitalize">
                        {getMethodIcon(log.method)}
                        <span>{log.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1 text-xs text-white/70">
                        <MapPin className="h-3 w-3 text-white/30" />
                        <span>{log.zone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-white/55">
                      {safeFormatDistanceToNow(log.timestamp)}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs">
                      {log.confidence ? (
                        <span className={cn(
                          "font-semibold",
                          log.confidence > 90 ? "text-[#00E5A8]" : "text-[#FB923C]"
                        )}>
                          {log.confidence.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge variant="auth" status={log.result} />
                    </TableCell>
                    <TableCell className="py-3.5 pr-6 text-right">
                      <span className="text-[10px] text-[#00E5A8] opacity-0 group-hover:opacity-100 transition-opacity">
                        Inspect
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ChartCard>

      {/* Log Inspector Dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-md bg-[#080808]/95 border-white/10 text-white backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-md font-semibold text-white/90">
              <Info className="h-4 w-4 text-[#00E5A8]" />
              Session Audit Verification
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Secure authentication metrics verified by NeoFace AaaS
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-3">
              {/* Main status header */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">Session ID</p>
                  <p className="font-mono text-xs text-white/80 mt-0.5">{selectedLog.id}</p>
                </div>
                <StatusBadge variant="auth" status={selectedLog.result} />
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/[0.015] p-3 rounded-lg border border-white/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Method</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {getMethodIcon(selectedLog.method)}
                    <span className="text-xs font-medium text-white/80 capitalize">{selectedLog.method}</span>
                  </div>
                </div>

                <div className="bg-white/[0.015] p-3 rounded-lg border border-white/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Verification Time</p>
                  <div className="flex items-center gap-1.5 mt-1 text-white/80">
                    <Clock className="h-3.5 w-3.5 text-white/30" />
                    <span className="text-xs font-medium">{safeFormatDate(selectedLog.timestamp)}</span>
                  </div>
                </div>

                <div className="bg-white/[0.015] p-3 rounded-lg border border-white/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Liveness Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {selectedLog.result === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00E5A8]/80" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-[#F87171]/80" />
                    )}
                    <span className="text-xs font-medium text-white/80">
                      {selectedLog.result === "success" ? "Liveness Valid" : "Liveness Suspicious"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.015] p-3 rounded-lg border border-white/[0.03]">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Confidence Score</p>
                  <p className="text-xs font-semibold text-white/85 mt-1">
                    {selectedLog.confidence ? `${selectedLog.confidence.toFixed(2)}%` : "N/A"}
                  </p>
                </div>
              </div>

              {/* Network and Location */}
              <div className="space-y-2 bg-white/[0.015] p-3 rounded-lg border border-white/[0.03] text-xs">
                <div className="flex justify-between">
                  <span className="text-white/30">IP Address</span>
                  <span className="font-mono text-white/70">{selectedLog.ip_address}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.03] pt-2 mt-2">
                  <span className="text-white/30">Access Zone</span>
                  <span className="text-white/70">{selectedLog.zone}</span>
                </div>
              </div>

              {/* Raw JSON metrics */}
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-wider text-white/30 pl-1">Raw Verification Parameters</p>
                <div className="max-h-[120px] overflow-y-auto bg-black border border-white/[0.05] p-2.5 rounded-lg font-mono text-[9px] text-[#00E5A8]/80 leading-relaxed scrollbar-thin">
                  <pre>{JSON.stringify(selectedLog.raw, null, 2)}</pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="h-8 text-xs border-white/10 hover:bg-white/[0.06] text-white/75"
                >
                  Close Audit Inspector
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
