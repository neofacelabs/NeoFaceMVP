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
import { useSecurityAlerts, useAccessControl, useModifyAccessControl, useLockdown, useReleaseLockdown, useSystemSettings } from "@/lib/api";
import { ShieldAlert, ShieldCheck, Skull, Ban, Globe, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SecurityCenterPage() {
  const [ipInput, setIpInput] = React.useState("");
  const [lockdownState, setLockdownState] = React.useState<"active" | "locked_down">("active");

  const { data: settingsData } = useSystemSettings();
  const { data: alertsData, isLoading: alertsLoading } = useSecurityAlerts(20);
  const { data: accessControl, isLoading: ipLoading, refetch: refetchIps } = useAccessControl();
  
  const modifyAccessControlMutation = useModifyAccessControl();
  const lockdownMutation = useLockdown();
  const releaseLockdownMutation = useReleaseLockdown();

  const handleLockdown = async () => {
    const confirmMsg = lockdownState === "active"
      ? "CRITICAL WARNING: This will temporarily block ALL authentication terminals platform-wide. No biometrics matching will pass. Proceed?"
      : "Release lockdown and restore normal authentication pipeline services?";
      
    if (!confirm(confirmMsg)) return;

    try {
      if (lockdownState === "active") {
        await lockdownMutation.mutateAsync({ scope: "global" });
        setLockdownState("locked_down");
        toast.warning("EMERGENCY SYSTEM LOCKDOWN ACTIVE");
      } else {
        await releaseLockdownMutation.mutateAsync({ scope: "global" });
        setLockdownState("active");
        toast.success("Lockdown released. System operational.");
      }
    } catch (err) {
      toast.error("Failed to execute lockdown action");
    }
  };

  const handleBlockIp = async () => {
    if (!ipInput) return;
    try {
      await modifyAccessControlMutation.mutateAsync({ action: "add_blacklist", ip: ipInput });
      toast.success(`IP address ${ipInput} added to blacklist`);
      setIpInput("");
      refetchIps();
    } catch (err) {
      toast.error("Failed to block IP");
    }
  };

  const handleUnblockIp = async (ip: string) => {
    try {
      await modifyAccessControlMutation.mutateAsync({ action: "remove_blacklist", ip });
      toast.success(`IP address ${ip} removed from blacklist`);
      refetchIps();
    } catch (err) {
      toast.error("Failed to unblock IP");
    }
  };

  const threats = alertsData?.threats || [];
  const blacklistedIps = accessControl?.blacklist || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Center"
        description="Platform threat detection feed, firewall control, and emergency global lockdown override."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Security Center" }]}
        actions={
          <Button
            onClick={handleLockdown}
            variant="danger"
            className={cn(
              "h-8 gap-1.5 text-xs font-bold transition-all",
              lockdownState === "locked_down" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            <Ban className="h-3.5 w-3.5" />
            {lockdownState === "locked_down" ? "Release System Lockdown" : "Platform-Wide Lockdown"}
          </Button>
        }
      />

      {/* Lockdown Alert Banner */}
      {lockdownState === "locked_down" && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-200"
        >
          <Skull className="h-8 w-8 mx-auto mb-2 text-red-500 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Emergency Lockdown Active</h2>
          <p className="text-xs text-red-300/80 mt-1">All verification terminals are locked. Authentication requests will return a 503 Service Unavailable error code.</p>
        </motion.div>
      )}

      {/* Security KPIs */}
      <KPIGrid>
        <KPICard
          label="Active Threats Alert"
          value={lockdownState === "locked_down" ? "SYSTEM LOCKED" : (alertsData ? alertsData.active_threats_count.toString() : "0")}
          color={lockdownState === "locked_down" ? "warning" : (threats.length > 0 ? "warning" : "success")}
        />
        <KPICard
          label="Firewall Blocks (Active)"
          value={blacklistedIps.length.toString()}
          sub_label="Active firewall blacklisted IPs"
        />
        <KPICard
          label="Strict Liveness Mode"
          value={settingsData?.liveness_strict_mode ? "ENABLED" : "DISABLED"}
          color={settingsData?.liveness_strict_mode ? "success" : "default"}
        />
        <KPICard
          label="IP Blacklist Entries"
          value={blacklistedIps.length.toString()}
        />
      </KPIGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Threat Alert Log */}
        <div className="lg:col-span-2">
          <ChartCard title="Security Alerts & Violations Feed" description="Immutable audit trace of flagged spoof attempts and abnormal api actions." index={0}>
            {alertsLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading threat alerts...</div>
            ) : threats.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-[#00E5A8] gap-1">
                <ShieldCheck className="h-4 w-4" /> System secure. No active threat logs found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Threat Details</TableHead>
                    <TableHead className="text-right">Risk Score</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threats.map((threat: any) => (
                    <TableRow key={threat.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                          <span className="font-semibold text-white text-xs">{threat.threat_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-red-400">
                        {(threat.risk_score * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="text-xs text-white/70 font-mono">{threat.ip_address}</TableCell>
                      <TableCell className="text-xs text-white/60 flex items-center gap-1">
                        <Globe className="h-3 w-3 text-white/30" /> {threat.location}
                      </TableCell>
                      <TableCell className="text-xs text-white/45">
                        {formatDistanceToNow(new Date(threat.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </div>

        {/* IP Access Control list */}
        <div>
          <ChartCard title="Terminal Firewall" description="Add or remove IP addresses from blacklist." index={1}>
            <div className="space-y-4">
              {/* Input block */}
              <div className="flex gap-2">
                <input
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="Block IP address..."
                  className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-red-500/35"
                />
                <Button onClick={handleBlockIp} size="sm" className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs gap-1">
                  <Plus className="h-3 w-3" /> Block
                </Button>
              </div>

              {/* IP list */}
              {ipLoading ? (
                <div className="text-xs text-white/40">Loading firewall...</div>
              ) : blacklistedIps.length === 0 ? (
                <div className="text-xs text-white/35">No blacklisted IPs.</div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {blacklistedIps.map((ip: string) => (
                    <div key={ip} className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-1.5 text-xs">
                      <span className="font-mono text-red-200">{ip}</span>
                      <button onClick={() => handleUnblockIp(ip)} className="text-white/40 hover:text-white">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
