"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useUpdateIdentity, useResetBiometrics, useDeleteIdentity } from "@/lib/api";
import {
  Search,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  User,
  RefreshCw,
  Loader2,
  Clock,
  Phone,
  Mail,
  Building,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Camera,
  Eye,
  Info
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

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

export default function IdentitiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [enrollFilter, setEnrollFilter] = useState("");

  const [identities, setIdentities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateMutation = useUpdateIdentity();
  const resetBiometricsMutation = useResetBiometrics();
  const deleteMutation = useDeleteIdentity();

  // Selection states for detailed inspector
  const [selectedIdentity, setSelectedIdentity] = useState<any | null>(null);
  const [firestoreProfile, setFirestoreProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchIdentities = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/admin/identities", {
        headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
      });
      setIdentities(res.data?.items || []);
    } catch (err) {
      console.error("Failed to load identities:", err);
      toast.error("Failed to retrieve identities directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentities();
  }, []);

  useEffect(() => {
    if (!selectedIdentity) {
      setFirestoreProfile(null);
      return;
    }

    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`/api/admin/identity-profile?external_user_id=${selectedIdentity.external_user_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
        });
        setFirestoreProfile(res.data?.profile || null);
      } catch (err) {
        console.error("Failed to load user Firestore profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [selectedIdentity]);

  const handleUpdateStatus = async (identityId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ identityId, payload: { status } });
      toast.success(`Identity status updated to ${status}`);
      fetchIdentities();
      if (selectedIdentity && selectedIdentity.id === identityId) {
        setSelectedIdentity((prev: any) => ({ ...prev, status }));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleResetBiometrics = async (identityId: string) => {
    if (!confirm("Are you sure you want to reset this identity's biometrics? This will permanently delete their enrolled face embedding and fingerprint keys.")) return;
    try {
      await resetBiometricsMutation.mutateAsync(identityId);
      toast.success("Identity biometrics reset successfully");
      fetchIdentities();
      // Reload details if open
      if (selectedIdentity && selectedIdentity.id === identityId) {
        setSelectedIdentity((prev: any) => ({
          ...prev,
          face_embedding_id: null,
          is_fingerprint_enrolled: false,
          is_iris_enrolled: false,
          enrollment_status: "pending"
        }));
      }
    } catch (err) {
      toast.error("Failed to reset biometrics");
    }
  };

  const handleDelete = async (identityId: string) => {
    if (!confirm("Are you sure you want to delete this identity profile? This action is irreversible.")) return;
    try {
      await deleteMutation.mutateAsync(identityId);
      toast.success("Identity deleted successfully");
      setSelectedIdentity(null);
      fetchIdentities();
    } catch (err) {
      toast.error("Failed to delete identity");
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    if (!userId) {
      toast.error("User ID not found for this identity profile.");
      return;
    }
    try {
      await axios.patch("/api/admin/identities", { userId, role }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
      });
      toast.success(`User role successfully updated to ${role}.`);
      fetchIdentities();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user role.");
    }
  };

  // Client-side filtering & search
  const filtered = identities.filter((item: any) => {
    const matchesSearch = search
      ? item.external_user_id.toLowerCase().includes(search.toLowerCase()) ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()) ||
        item.neoId?.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesType = typeFilter ? item.identity_type === typeFilter : true;
    const matchesEnroll = enrollFilter ? item.enrollment_status === enrollFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesType && matchesEnroll && matchesStatus;
  });

  const total = filtered.length;
  const faceEnrolledCount = filtered.filter((i: any) => i.face_embedding_id).length;
  const fingerprintEnrolledCount = filtered.filter((i: any) => i.is_fingerprint_enrolled).length;
  const activeCount = filtered.filter((i: any) => i.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identities"
        description="Unified registry of all verified biometric subject profiles enrolled on the platform."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Identities" }]}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Identities", value: total, color: "text-white" },
          { label: "Face Enrolled", value: faceEnrolledCount, color: "text-[#00E5A8]" },
          { label: "Fingerprint Enrolled", value: fingerprintEnrolledCount, color: "text-[#38BDF8]" },
          { label: "Active", value: activeCount, color: "text-[#00E5A8]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-[12px] border border-white/[0.065] bg-white/[0.025] p-4"
          >
            <p className="kpi-label mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <ChartCard title="Global Identity Directory" description="Explore, filter, and inspect enrolled subjects and biometrics status." index={0}>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search identities (external user ID, name, email, neoID)..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Identity Types</option>
              <option value="member">Member</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
              <option value="visitor">Visitor</option>
              <option value="contractor">Contractor</option>
            </select>

            <select
              value={enrollFilter}
              onChange={(e) => setEnrollFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">Biometrics Status</option>
              <option value="enrolled">Enrolled</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Lifecycles</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8] mr-2 inline" />
            Loading identities directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            No identities found matching the filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>External User ID / Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Enrollment Status</TableHead>
                <TableHead>Key Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((identity: any) => (
                <TableRow 
                  key={identity.id}
                  onClick={() => setSelectedIdentity(identity)}
                  className="cursor-pointer hover:bg-white/[0.015] transition-colors group"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 shrink-0 overflow-hidden">
                        {identity.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={identity.photoURL} alt={identity.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-white/45" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate max-w-[150px]">{identity.name || identity.external_user_id}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5 truncate max-w-[150px]">NeoID: {identity.neoId || "Pending"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-white/70 max-w-[160px] truncate">
                    {identity.email}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-white/70 capitalize">
                    {identity.identity_type}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                      identity.enrollment_status === "enrolled" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      identity.enrollment_status === "pending" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400" :
                      "border-red-500/20 bg-red-500/10 text-red-400"
                    )}>
                      {identity.enrollment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[10.5px]">
                      {identity.face_embedding_id && (
                        <span className="rounded bg-[#00E5A8]/10 px-1 py-0.5 text-[#00E5A8] border border-[#00E5A8]/15">Face</span>
                      )}
                      {identity.is_fingerprint_enrolled && (
                        <span className="rounded bg-sky-500/10 px-1 py-0.5 text-sky-400 border border-sky-500/15">Fingerprint</span>
                      )}
                      {!identity.face_embedding_id && !identity.is_fingerprint_enrolled && (
                        <span className="text-white/30">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                      identity.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      identity.status === "suspended" ? "border-red-500/20 bg-red-500/10 text-red-400" :
                      "border-white/10 bg-white/5 text-white/45"
                    )}>
                      {identity.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-white/60">
                    {safeFormatDistanceToNow(identity.created_at)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIdentity(identity)}
                        className="h-7 text-[10.5px] border border-white/5 hover:bg-white/5 hover:text-white"
                      >
                        Inspect
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/5 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] border-white/[0.08] bg-[#0c0c0c] text-white shadow-xl">
                          {identity.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(identity.id, "suspended")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                              <Pause className="h-3.5 w-3.5 text-yellow-500" />
                              Suspend Profile
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(identity.id, "active")} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                              <Play className="h-3.5 w-3.5 text-emerald-500" />
                              Activate Profile
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleResetBiometrics(identity.id)} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                            <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                            Reset Biometrics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateUserRole(identity.external_user_id, "member")}
                            className="gap-2 text-xs focus:bg-white/5 focus:text-white"
                          >
                            <User className="h-3.5 w-3.5 text-sky-400" />
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateUserRole(identity.external_user_id, "admin")}
                            className="gap-2 text-xs focus:bg-white/5 focus:text-white"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                            Make Org Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateUserRole(identity.external_user_id, "super_admin")}
                            className="gap-2 text-xs focus:bg-white/5 focus:text-white"
                          >
                            <Building className="h-3.5 w-3.5 text-[#00E5A8]" />
                            Make Super Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(identity.id)} className="gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                            Purge Identity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>

      {/* Identity Detail Inspector Dialog */}
      <Dialog open={selectedIdentity !== null} onOpenChange={(open) => !open && setSelectedIdentity(null)}>
        <DialogContent className="max-w-2xl bg-[#080808]/95 border-white/10 text-white backdrop-blur-xl rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-md font-semibold text-white/90 border-b border-white/[0.06] pb-2.5">
              <Info className="h-4 w-4 text-[#00E5A8]" />
              Secure Identity Verification Inspector
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Live identity metrics and Firestore profile sync parameters
            </DialogDescription>
          </DialogHeader>

          {selectedIdentity && (
            <div className="space-y-5 py-2">
              
              {/* Header Status & UUID Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">External identity reference</p>
                  <p className="font-semibold text-white text-sm mt-0.5">{selectedIdentity.external_user_id}</p>
                  <p className="text-[10px] text-white/30 font-mono mt-0.5">DB Identity ID: {selectedIdentity.id}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded bg-[#00E5A8]/10 border border-[#00E5A8]/20 px-2 py-0.5 text-[9px] font-semibold text-[#00E5A8] uppercase tracking-wider">
                    {selectedIdentity.identity_type}
                  </span>
                  <StatusBadge variant="member" status={selectedIdentity.status.toLowerCase()} />
                </div>
              </div>

              {/* Grid content split between Firestore user profile details & Biometric data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Side: Firestore User Profile */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider border-l-2 border-[#00E5A8] pl-2 leading-none">
                    Digital ID & Contact Details
                  </h4>
                  
                  {loadingProfile ? (
                    <div className="flex h-36 items-center justify-center border border-white/[0.04] bg-white/[0.005] rounded-xl">
                      <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
                    </div>
                  ) : firestoreProfile ? (
                    <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/20 border border-white/10 flex items-center justify-center text-white/60 text-lg font-bold uppercase overflow-hidden shrink-0">
                          {firestoreProfile.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={firestoreProfile.photoURL} alt={firestoreProfile.name} className="h-full w-full object-cover" />
                          ) : (
                            firestoreProfile.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[13px] font-semibold text-white/90 truncate">{firestoreProfile.name}</h5>
                          <span className="rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/15 px-1.5 py-0.5 text-[8.5px] font-semibold text-[#00E5A8] select-none">
                            {firestoreProfile.verificationLevel || "VERIFIED"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/[0.04] pt-3.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-white/20" />
                            Email Address
                          </span>
                          <span className="text-white/85 font-medium">{firestoreProfile.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-white/20" />
                            Phone Coordinate
                          </span>
                          <span className="text-white/85 font-medium">{firestoreProfile.phone || "Not Enrolled"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-white/20" />
                            Permanent NeoID
                          </span>
                          <span className="text-[#00E5A8] font-mono font-semibold">{firestoreProfile.neoId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-white/20" />
                            Joined Portal
                          </span>
                          <span className="text-white/70 font-medium">{safeFormatDate(firestoreProfile.createdAt)}</span>
                        </div>
                      </div>

                      {/* Render QR code preview */}
                      {firestoreProfile.qrCode && (
                        <div className="border-t border-white/[0.04] pt-3 flex flex-col items-center gap-2">
                          <p className="text-[9.5px] text-white/30 font-medium">Digital ID Signature QR Code</p>
                          <div className="h-20 w-20 bg-white p-1 rounded border border-white/10 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={firestoreProfile.qrCode} alt="QR Code" className="h-full w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] space-y-3.5">
                      {/* Fallback to inline identity data if firestoreProfile wasn't fetchable */}
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/20 border border-white/10 flex items-center justify-center text-white/60 text-lg font-bold uppercase overflow-hidden shrink-0">
                          {selectedIdentity.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedIdentity.photoURL} alt={selectedIdentity.name} className="h-full w-full object-cover" />
                          ) : (
                            selectedIdentity.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[13px] font-semibold text-white/90 truncate">{selectedIdentity.name || "Enrolled User"}</h5>
                          <span className="rounded-full bg-white/5 border border-white/10 px-1.5 py-0.5 text-[8.5px] font-semibold text-white/50">
                            VERIFIED
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/[0.04] pt-3.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-white/20" />
                            Email Address
                          </span>
                          <span className="text-white/85 font-medium">{selectedIdentity.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-white/20" />
                            Phone Coordinate
                          </span>
                          <span className="text-white/85 font-medium">{selectedIdentity.phone || "Not Enrolled"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-white/20" />
                            Permanent NeoID
                          </span>
                          <span className="text-[#00E5A8] font-mono font-semibold">{selectedIdentity.neoId || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/35 flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-white/20" />
                            Joined Portal
                          </span>
                          <span className="text-white/70 font-medium">{safeFormatDate(selectedIdentity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: SQL Biometrics and System Data */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider border-l-2 border-sky-400 pl-2 leading-none">
                    Security Credentials & Keys
                  </h4>
                  
                  <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] space-y-3.5 text-[11px]">
                    <div className="flex justify-between items-center py-0.5 border-b border-white/[0.03] pb-2">
                      <span className="text-white/40">Enrollment Lifecycle</span>
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        selectedIdentity.enrollment_status === "enrolled" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {selectedIdentity.enrollment_status}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {/* Face Biometric Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/35 flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-[#00E5A8]/70" />
                          Face Embedding ID
                        </span>
                        {selectedIdentity.face_embedding_id ? (
                          <span className="font-mono text-white/75 text-[10px] select-all truncate max-w-[120px]">
                            {selectedIdentity.face_embedding_id}
                          </span>
                        ) : (
                          <span className="text-white/20 select-none">Not Enrolled</span>
                        )}
                      </div>

                      {/* Fingerprint Biometric Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/35 flex items-center gap-1.5">
                          <Fingerprint className="h-3.5 w-3.5 text-sky-400/70" />
                          Fingerprint Keys
                        </span>
                        <span className="text-white/75 font-medium">
                          {selectedIdentity.is_fingerprint_enrolled ? "Enrolled & Active" : "Not Enrolled"}
                        </span>
                      </div>

                      {/* Iris Biometric Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/35 flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-purple-400/70" />
                          Iris Recognition
                        </span>
                        <span className="text-white/75 font-medium">
                          {selectedIdentity.is_iris_enrolled ? "Enrolled & Active" : "Not Enrolled"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-white/[0.04] pt-3 text-[10px] text-white/35">
                      <div className="flex justify-between">
                        <span>Organization ID</span>
                        <span className="font-mono truncate max-w-[140px] text-white/50">{selectedIdentity.organization_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Application ID</span>
                        <span className="font-mono truncate max-w-[140px] text-white/50">{selectedIdentity.application_id}</span>
                      </div>
                      {selectedIdentity.site_id && (
                        <div className="flex justify-between">
                          <span>Assigned Site ID</span>
                          <span className="font-mono truncate max-w-[140px] text-white/50">{selectedIdentity.site_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Raw metadata parameters */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-white/30 pl-1 font-semibold">Raw Identity Parameters</p>
                <div className="max-h-[140px] overflow-y-auto bg-black border border-white/[0.05] p-3 rounded-lg font-mono text-[9px] text-[#00E5A8]/80 leading-relaxed scrollbar-thin">
                  <pre>{JSON.stringify({ ...selectedIdentity, firestoreProfile }, null, 2)}</pre>
                </div>
              </div>

              {/* Drawer actions footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-white/[0.06] pt-4 mt-3 gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-white/10 text-white/70 hover:bg-white/[0.05]"
                    onClick={() => handleResetBiometrics(selectedIdentity.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                    Reset Biometrics
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-400 border-red-500/10 hover:bg-red-500/5 hover:border-red-500/20"
                    onClick={() => handleDelete(selectedIdentity.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Purge Identity
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedIdentity.status === "active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-yellow-500/10 text-yellow-500 hover:bg-yellow-500/5"
                      onClick={() => handleUpdateStatus(selectedIdentity.id, "suspended")}
                    >
                      <Pause className="h-3.5 w-3.5 mr-1.5" />
                      Suspend Profile
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => handleUpdateStatus(selectedIdentity.id, "active")}
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Activate Profile
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedIdentity(null)}
                    className="h-8 text-xs text-white/50 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
