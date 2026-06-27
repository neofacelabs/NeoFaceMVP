"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Settings, Shield, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function OrganizationSettingsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = React.use(params);
  
  const [name, setName] = useState("");
  const [mfa, setMfa] = useState("optional");
  const [threshold, setThreshold] = useState(0.85);
  const [strictness, setStrictness] = useState("high");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data } = await apiClient.get("settings");
        setName(data.name || "");
        setMfa(data.mfa_policy || "optional");
        setThreshold(data.default_match_threshold || 0.85);
        setStrictness(data.liveness_strictness || "high");
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.patch("settings", {
        name,
        mfa_policy: mfa,
        default_match_threshold: threshold,
        liveness_strictness: strictness
      });
      toast.success("Workspace settings saved successfully!");
    } catch {
      toast.error("Failed to update settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Settings"
        description="Configure organization profile, default biometric matching tolerances, and administrative policies."
        breadcrumbs={[{ label: "Organization" }, { label: "Settings" }]}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* General Section */}
          <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <User className="h-4 w-4 text-[#00E5A8]" />
              General Organization Profile
            </h3>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/40">Organization Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ACME Labs Corp"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/40">Workspace Slug URL-safe Prefix</label>
              <input
                type="text"
                value={orgSlug}
                disabled
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.01] px-3 py-2 text-xs text-white/30 cursor-not-allowed focus:outline-none"
              />
              <span className="text-[10px] text-white/20 block">The workspace slug is used in routing and can only be updated by a Super Admin.</span>
            </div>
          </div>

          {/* Biometric Tolerances Section */}
          <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.015] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <Shield className="h-4 w-4 text-[#00E5A8]" />
              Global Biometric Match & Liveness Thresholds
            </h3>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/40">Default Face Matching Threshold (Cosine Similarity)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="flex-1 accent-[#00E5A8] h-1 bg-white/10 rounded-lg cursor-pointer"
                />
                <span className="w-12 text-center text-xs font-semibold text-white bg-white/[0.04] rounded py-1 px-1.5 border border-white/[0.08]">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-white/25 block">Higher values require closer similarity to match faces, reducing false acceptances but raising false rejection rates.</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/40">Liveness Verification Strictness</label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
              >
                <option value="low" className="bg-[#0c0c0c]">Low (Lenient liveness checks)</option>
                <option value="medium" className="bg-[#0c0c0c]">Medium (Recommended for general offices)</option>
                <option value="high" className="bg-[#0c0c0c]">High (Maximum liveness restriction - blocks masks and deepfakes)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/40">SMTP & MFA Policy</label>
              <select
                value={mfa}
                onChange={(e) => setMfa(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
              >
                <option value="optional" className="bg-[#0c0c0c]">Optional (MFA requested but skip allowed)</option>
                <option value="required" className="bg-[#0c0c0c]">Required (All logins must pass WebAuthn/TOTP challenge)</option>
                <option value="disabled" className="bg-[#0c0c0c]">Disabled (Biometric login only)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 gap-1.5 px-5 font-semibold text-xs"
            >
              {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
