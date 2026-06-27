"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { useSystemSettings, useUpdateSystemSettings } from "@/lib/api";
import { Settings, ShieldCheck, Mail, Sliders, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSystemSettings();
  const updateMutation = useUpdateSystemSettings();

  const [smtpServer, setSmtpServer] = React.useState("");
  const [smtpPort, setSmtpPort] = React.useState(587);
  const [smtpSender, setSmtpSender] = React.useState("");
  const [mfaPolicy, setMfaPolicy] = React.useState("optional");
  const [faceThreshold, setFaceThreshold] = React.useState(0.85);

  // Sync state once data loads
  React.useEffect(() => {
    if (settings) {
      setSmtpServer(settings.smtp_server);
      setSmtpPort(settings.smtp_port);
      setSmtpSender(settings.smtp_sender);
      setMfaPolicy(settings.mfa_policy);
      setFaceThreshold(settings.default_face_threshold);
    }
  }, [settings]);

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        smtp_server: smtpServer,
        smtp_port: smtpPort,
        smtp_sender: smtpSender,
        mfa_policy: mfaPolicy,
        default_face_threshold: faceThreshold,
      });
      toast.success("System configurations updated successfully");
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const handleToggleMaintenance = async () => {
    if (!settings) return;
    const nextVal = !settings.maintenance_mode;
    const confirmMsg = nextVal
      ? "ACTIVATE MAINTENANCE MODE? This will block API access to all non-admin client accounts."
      : "Deactivate maintenance mode and restore general platform API operations?";
      
    if (!confirm(confirmMsg)) return;

    try {
      await updateMutation.mutateAsync({ maintenance_mode: nextVal });
      toast.success(`Maintenance mode is now ${nextVal ? "ENABLED" : "DISABLED"}`);
    } catch (err) {
      toast.error("Failed to toggle maintenance mode");
    }
  };

  const handleToggleLiveness = async () => {
    if (!settings) return;
    const nextVal = !settings.liveness_strict_mode;
    try {
      await updateMutation.mutateAsync({ liveness_strict_mode: nextVal });
      toast.success(`Strict liveness mode is now ${nextVal ? "ENABLED" : "DISABLED"}`);
    } catch (err) {
      toast.error("Failed to update liveness strict mode");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control Center Settings"
        description="Configure SMTP relays, authentication security policies, and AI liveness match thresholds."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Settings" }]}
      />

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading settings...</div>
      ) : !settings ? (
        <div className="flex h-32 items-center justify-center text-sm text-white/45">No configurations loaded.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main settings form */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard title="Platform Global Variables" description="Main parameters controlling the API and verification engines." index={0}>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                {/* SMTP block */}
                <div className="border-b border-white/[0.06] pb-4 space-y-3">
                  <h4 className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Mail className="h-4 w-4 text-sky-400" /> Outgoing SMTP Server Configuration
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Host Server</label>
                      <input
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5A8]/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5A8]/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Sender Address</label>
                      <input
                        value={smtpSender}
                        onChange={(e) => setSmtpSender(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5A8]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Policies block */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Sliders className="h-4 w-4 text-[#00E5A8]" /> Biometric Verification Options
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">MFA Security Policy</label>
                      <select
                        value={mfaPolicy}
                        onChange={(e) => setMfaPolicy(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#00E5A8]/30"
                      >
                        <option value="optional">Optional (Configured per Org)</option>
                        <option value="enforced">Strict (Enforce MFA globally)</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Default Face Match Threshold</label>
                      <input
                        type="number"
                        step={0.01}
                        min={0.5}
                        max={0.99}
                        value={faceThreshold}
                        onChange={(e) => setFaceThreshold(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5A8]/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06]">
                  <Button type="submit" size="sm" className="h-8 text-xs bg-[#00E5A8] text-black hover:bg-[#00c28e]">
                    Save Configurations
                  </Button>
                </div>
              </form>
            </ChartCard>
          </div>

          {/* Action states card */}
          <div className="space-y-6">
            <ChartCard title="Platform Maintenance Override" description="Restrict API capabilities for debugging sessions." index={1}>
              <div className="space-y-4">
                {/* Maintenance toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white text-xs">Maintenance Mode</h5>
                    <p className="text-[10px] text-white/40 mt-0.5">Locks API client endpoints</p>
                  </div>
                  <button onClick={handleToggleMaintenance} className="text-[#00E5A8] hover:text-white transition-colors">
                    {settings.maintenance_mode ? (
                      <ToggleRight className="h-7 w-7 text-red-500" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-white/20" />
                    )}
                  </button>
                </div>

                {/* Strict Liveness Mode toggle */}
                <div className="flex items-center justify-between border-t border-white/[0.05] pt-4">
                  <div>
                    <h5 className="font-semibold text-white text-xs">Strict Liveness Checks</h5>
                    <p className="text-[10px] text-white/40 mt-0.5">Enforces active liveness pose checks</p>
                  </div>
                  <button onClick={handleToggleLiveness} className="text-[#00E5A8] hover:text-white transition-colors">
                    {settings.liveness_strict_mode ? (
                      <ToggleRight className="h-7 w-7 text-[#00E5A8]" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-white/20" />
                    )}
                  </button>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
