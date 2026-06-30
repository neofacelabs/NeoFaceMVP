"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ShieldAlert, Check, Play, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function OrganizationSecurityPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const [threats, setThreats] = useState<any[]>([]);
  const [blocklist, setBlocklist] = useState<any[]>([]);
  const [lockedDown, setLockedDown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSecurityData() {
      try {
        setLoading(true);
        const [threatsRes, blocklistRes] = await Promise.all([
          apiClient.get("security/threat-alerts"),
          apiClient.get("security/blocklist")
        ]);
        setThreats(threatsRes.data.threats || []);
        setBlocklist(blocklistRes.data.blocked_identities || []);
      } catch (err) {
        console.error("Failed to load security metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSecurityData();
  }, []);

  const handleLockdown = async () => {
    try {
      setSubmitting(true);
      if (lockedDown) {
        await apiClient.post("security/lockdown/release", { scope: "organization" });
        setLockedDown(false);
        toast.success("Emergency lockdown successfully released.");
      } else {
        await apiClient.post("security/lockdown", { scope: "organization" });
        setLockedDown(true);
        toast.error("Emergency lockdown initiated! All terminal verifications suspended.");
      }
    } catch {
      toast.error("Lockdown state change failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Center"
        description="Monitor active biometric threats, configure anti-spoof policies, and trigger emergency lockdowns."
        breadcrumbs={[{ label: "Organization" }, { label: "Security" }]}
      />

      {/* Lockdown Status Card */}
      <div className={`rounded-[14px] border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${lockedDown ? "border-red-500/30 bg-red-500/5" : "border-white/[0.065] bg-white/[0.025]"}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${lockedDown ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" : "bg-white/[0.04] border-white/[0.08] text-white/50"}`}>
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Emergency Workspace Lockdown</h3>
            <p className="text-xs text-white/45">
              {lockedDown 
                ? "Immediate security halt is ACTIVE. All physical authentication gates are locked." 
                : "Active operations running normally. Trigger to instantly lock down all site entry points."
              }
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleLockdown}
          disabled={submitting}
          variant={lockedDown ? "outline" : "default"}
          className={`h-9 font-semibold text-xs transition-all ${lockedDown ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "bg-red-500 hover:bg-red-600 text-white border-none"}`}
        >
          {submitting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : lockedDown ? (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
          )}
          {lockedDown ? "Release Lockdown" : "Initiate Lockdown"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Threat Alerts */}
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Active Security Incidents
          </h3>
          
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8]" />
            </div>
          ) : threats.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/20">
              No recent threats or violations recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {threats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  <div>
                    <p className="text-xs font-semibold text-white/80">{threat.threat_type}</p>
                    <p className="text-[10px] text-white/35">IP: {threat.ip_address} | Risk: {Math.round(threat.risk_score * 100)}%</p>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">{threat.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suspended Identities */}
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            Suspended Subjects
          </h3>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8]" />
            </div>
          ) : blocklist.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/20">
              No suspended identity profiles.
            </div>
          ) : (
            <div className="space-y-3">
              {blocklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                  <div>
                    <p className="text-xs font-semibold text-white/80">{item.external_user_id}</p>
                    <p className="text-[10px] text-white/35">{item.reason}</p>
                  </div>
                  <span className="text-[10px] text-white/30">{new Date(item.blocked_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
