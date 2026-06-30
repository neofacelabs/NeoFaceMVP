"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Phone,
  Mail,
  Shield,
  Loader2,
  Calendar,
  Save,
  Fingerprint,
  Upload,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

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
    return format(d, "MMMM d, yyyy");
  } catch (err) {
    return "N/A";
  }
}

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function getProfile() {
      try {
        const meRes = await axios.get("/api/member/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
        }).catch((err) => {
          console.warn("Failed to fetch local member profile, falling back to backend me():", err);
          return authApi.me();
        });
        const d = meRes.data;
        setProfile(d);
        setName(d?.name || "");
        setPhone(d?.phone || "");
      } catch (err) {
        console.error("Failed to load user profile:", err);
        toast.error("Failed to load profile parameters.");
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Display Name is required.");
      return;
    }

    try {
      setSaving(true);
      const res = await axios.patch(
        "/api/member/profile",
        { name, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` } }
      );
      setProfile(res.data);
      toast.success("Profile details updated successfully! 🎉");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  const m = {
    id: profile?.id || profile?.uid || "",
    neoId: profile?.neoId || "NEO-PEND-INGX-1234",
    email: profile?.email || "",
    role: profile?.role || "MEMBER",
    status: profile?.status || "ACTIVE",
    verificationLevel: profile?.verificationLevel || "VERIFIED",
    created_at: profile?.createdAt || profile?.created_at || new Date().toISOString(),
    photoURL: profile?.photoURL || "",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your identity settings, contact coordinates, and view system permissions."
        breadcrumbs={[
          { label: "Member Portal", href: "/me" },
          { label: "Profile" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card / Avatar info */}
        <div className="space-y-6">
          <ChartCard
            title="Digital Identity Profile"
            description="Your public avatar information inside NeoFace Cloud"
            index={0}
          >
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="relative group select-none">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/20 border-2 border-white/[0.08] flex items-center justify-center text-white/50 text-2xl font-bold uppercase overflow-hidden">
                  {m.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoURL} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    name.charAt(0) || "U"
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Upload className="h-4 w-4 text-white/80" />
                </div>
              </div>

              <div>
                <h4 className="text-[14.5px] font-semibold text-white/90 leading-tight">{name}</h4>
                <p className="text-[10px] text-white/35 font-mono mt-1 uppercase tracking-wider">{m.role}</p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 px-2.5 py-0.5 text-[9.5px] font-medium text-[#00E5A8]">
                <CheckCircle2 className="h-3 w-3" />
                {m.verificationLevel} ACCOUNT
              </div>

              {/* Administrative read-only metrics */}
              <div className="w-full border-t border-white/[0.05] pt-4 text-left space-y-3.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/30">System UUID</span>
                  <span className="font-mono text-white/60 select-all truncate max-w-[150px]">{m.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Permanent NeoID</span>
                  <span className="font-mono font-semibold text-[#00E5A8]/80 select-all">{m.neoId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Portal Status</span>
                  <StatusBadge variant="member" status={m.status.toLowerCase()} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/30">Joined Portal</span>
                  <span className="text-white/60 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-white/20" />
                    {safeFormatDate(m.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Edit fields form */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="Profile Parameters"
            description="Update your contact settings. These changes synchronize instantly across readers."
            index={1}
          >
            <form onSubmit={handleSave} className="space-y-5 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-white/25" />
                    Display Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="h-9 bg-white/[0.02] border-white/10 text-white placeholder-white/20 text-xs rounded-lg focus:border-[#00E5A8]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-white/25" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    className="h-9 bg-white/[0.02] border-white/10 text-white placeholder-white/20 text-xs rounded-lg focus:border-[#00E5A8]/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/40 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-white/25" />
                  Account Email (Read-only)
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={m.email}
                    disabled
                    className="h-9 bg-white/[0.005] border-white/5 text-white/40 text-xs rounded-lg select-none pr-10"
                  />
                  <Shield className="absolute right-3 top-2.5 h-4 w-4 text-white/15" />
                </div>
                <p className="text-[9.5px] text-white/25">Email parameters are locked to your authentication identity provider.</p>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/[0.04]">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-8 text-xs font-semibold px-4 gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
