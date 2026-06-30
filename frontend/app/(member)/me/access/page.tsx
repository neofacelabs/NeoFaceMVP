"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccessZones } from "@/lib/api/access-zones";
import { useSites } from "@/lib/api/sites";
import {
  Search,
  Loader2,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Building,
  Key,
  DoorOpen,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function MemberAccessPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "authorized" | "restricted">("all");

  const { data: sitesData } = useSites();
  const { data: zonesData, isLoading: loadingZones } = useAccessZones(1, 100);

  useEffect(() => {
    async function getProfile() {
      try {
        const meRes = await axios.get("/api/member/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
        }).catch((err) => {
          console.warn("Failed to fetch local member profile, falling back to backend me():", err);
          return authApi.me();
        });
        setProfile(meRes.data);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        toast.error("Failed to load digital ID profile.");
      } finally {
        setLoadingProfile(false);
      }
    }
    getProfile();
  }, []);

  if (loadingProfile || loadingZones) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const userUuid = profile?.id || profile?.uid || "";
  const zones = zonesData?.items || [];
  const sites = sitesData?.items || [];

  // Map site names for easier display
  const siteMap = new Map<string, string>();
  sites.forEach((s: any) => siteMap.set(s.id, s.name));

  // Process access status
  const mappedZones = zones.map((z: any) => {
    // Check if user has active clearance for this zone
    const isAuthorized = Array.isArray(z.allowed_identities) && 
      z.allowed_identities.some((id: string) => id === userUuid || id === profile?.uid);

    // Format schedule
    let scheduleText = "24/7 Unlimited Access";
    if (z.allowed_schedule && Object.keys(z.allowed_schedule).length > 0) {
      const days = z.allowed_schedule.days ? z.allowed_schedule.days.join(", ") : "Custom Days";
      const hours = z.allowed_schedule.start && z.allowed_schedule.end 
        ? `${z.allowed_schedule.start} - ${z.allowed_schedule.end}` 
        : "Custom Hours";
      scheduleText = `${days} (${hours})`;
    }

    // Format policy requirements
    let policyText = "Single Factor (PIN / QR)";
    if (z.security_policies && typeof z.security_policies === "object") {
      const req = [];
      if (z.security_policies.liveness_check) req.push("Spoof Check (Liveness)");
      if (z.security_policies.min_confidence) req.push(`Face ID Match (${z.security_policies.min_confidence * 100}%+)`);
      if (z.security_policies.mfa_required) req.push("Multifactor Biometric Sign-in");
      if (req.length > 0) {
        policyText = req.join(" + ");
      }
    }

    return {
      id: z.id,
      name: z.name,
      description: z.description || "Secure enterprise space.",
      siteName: siteMap.get(z.site_id) || "Default Site",
      isAuthorized,
      schedule: scheduleText,
      policies: policyText,
    };
  });

  // Filter zones
  const filteredZones = mappedZones.filter((z: any) => {
    const matchesSearch = search
      ? z.name.toLowerCase().includes(search.toLowerCase()) ||
        z.description.toLowerCase().includes(search.toLowerCase()) ||
        z.siteName.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesStatus = statusFilter === "all"
      ? true
      : statusFilter === "authorized" ? z.isAuthorized : !z.isAuthorized;

    return matchesSearch && matchesStatus;
  });

  const totalAuthorized = mappedZones.filter((z: any) => z.isAuthorized).length;
  const totalRestricted = mappedZones.length - totalAuthorized;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Access Clearances"
        description="Verify spatial authorization permissions, site entries, and entry policies."
        breadcrumbs={[
          { label: "Member Portal", href: "/me" },
          { label: "My Access" }
        ]}
      />

      <KPIGrid columns={3}>
        <KPICard label="Total Spatial Clearances" value={mappedZones.length} index={0} />
        <KPICard label="Authorized Gates" value={totalAuthorized} color="success" index={1} />
        <KPICard label="Restricted Entryways" value={totalRestricted} color="error" index={2} />
      </KPIGrid>

      {/* Filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search by zone, building, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white/[0.02] border-white/10 text-white placeholder-white/30 text-xs rounded-lg focus:border-[#00E5A8]/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.05]">
            {(["all", "authorized", "restricted"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1 text-[10.5px] font-medium rounded-md capitalize transition-all",
                  statusFilter === s
                    ? "bg-[#00E5A8]/15 text-[#00E5A8] border border-[#00E5A8]/20"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Access Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredZones.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
            <Building className="mx-auto h-8 w-8 text-white/10 mb-3" />
            <p className="text-[13px] font-medium text-white/75">No Access Zones Found</p>
            <p className="text-[11px] text-white/35 mt-1 max-w-xs mx-auto">
              You are currently not listed in any physical access zones. Contact your organization administrator to assign permissions.
            </p>
          </div>
        ) : (
          filteredZones.map((zone: any, i: number) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-[14px] border p-5 flex flex-col justify-between transition-all duration-300",
                zone.isAuthorized 
                  ? "border-[#00E5A8]/15 bg-[#00E5A8]/[0.02] shadow-[0_0_20px_-12px_rgba(0,229,168,0.25)] hover:border-[#00E5A8]/30"
                  : "border-white/[0.065] bg-white/[0.02] opacity-75 hover:opacity-90"
              )}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border shrink-0",
                      zone.isAuthorized 
                        ? "bg-[#00E5A8]/10 border-[#00E5A8]/20" 
                        : "bg-white/[0.04] border-white/[0.08]"
                    )}>
                      <DoorOpen className={cn("h-4.5 w-4.5", zone.isAuthorized ? "text-[#00E5A8]" : "text-white/30")} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13.5px] font-semibold text-white/95 truncate leading-tight">{zone.name}</h4>
                      <p className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{zone.siteName}</span>
                      </p>
                    </div>
                  </div>
                  {zone.isAuthorized ? (
                    <div className="flex h-5 items-center gap-1 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 px-2 text-[9px] font-semibold text-[#00E5A8] uppercase tracking-wider shrink-0 select-none">
                      <ShieldCheck className="h-3 w-3" />
                      Clear
                    </div>
                  ) : (
                    <div className="flex h-5 items-center gap-1 rounded-full bg-[#F87171]/10 border border-[#F87171]/20 px-2 text-[9px] font-semibold text-[#F87171] uppercase tracking-wider shrink-0 select-none">
                      <ShieldAlert className="h-3 w-3" />
                      Locked
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-white/35 line-clamp-2 leading-relaxed mb-4">
                  {zone.description}
                </p>
              </div>

              <div className="space-y-2 border-t border-white/[0.04] pt-3.5 mt-auto">
                <div className="flex items-center gap-2 text-[10.5px]">
                  <Clock className="h-3.5 w-3.5 text-white/20 shrink-0" />
                  <span className="text-white/40">Schedule:</span>
                  <span className="text-white/75 truncate font-medium">{zone.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px]">
                  <Key className="h-3.5 w-3.5 text-white/20 shrink-0" />
                  <span className="text-white/40">Access Policy:</span>
                  <span className="text-white/75 truncate font-medium">{zone.policies}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
