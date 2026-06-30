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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrganizations } from "@/lib/api";
import {
  UserPlus,
  Search,
  Building2,
  Mail,
  Lock,
  User,
  ShieldAlert,
  Loader2,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  ClipboardCheck,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

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

export default function CredentialsPage() {
  const [search, setSearch] = useState("");
  const [identities, setIdentities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [orgId, setOrgId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success State
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch Organizations for dropdown
  const { data: orgsData } = useOrganizations(1, 100);
  const orgs = orgsData?.items || [];

  const fetchIdentities = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/admin/identities", {
        headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
      });
      setIdentities(res.data?.items || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to retrieve credentials registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentities();
  }, []);

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let generatedPass = "";
    for (let i = 0; i < 12; i++) {
      generatedPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generatedPass);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");
    if (!orgId) return toast.error("Organization is required");

    try {
      setSubmitting(true);
      const res = await axios.post(
        "/api/admin/generate-credentials",
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: role,
          organizationId: orgId
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("bioid_access_token")}` }
        }
      );
      
      setSuccessResult({
        name,
        email,
        password,
        role: role === "org_admin" ? "Organization Admin" : "Standard Member",
        orgName: orgs.find((o: any) => o.id === orgId)?.name || "Default Org",
        neoId: res.data.user.neoId,
        qrCode: res.data.user.qrCode
      });
      
      toast.success("Credentials generated successfully!");
      setIsGenerateOpen(false);
      
      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setRole("member");
      setOrgId("");
      
      fetchIdentities();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to generate credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successResult) return;
    const text = `NeoFace Credentials\n-----------------\nName: ${successResult.name}\nEmail: ${successResult.email}\nPassword: ${successResult.password}\nRole: ${successResult.role}\nOrganization: ${successResult.orgName}\nNeoID: ${successResult.neoId}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Client-side filtering
  const filtered = identities.filter((item: any) => {
    const matchesSearch = search
      ? item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase()) ||
        item.neoId?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credentials Control"
        description="Generate, provision, and audit user logins for Admins and Members."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Credentials" }]}
        actions={
          <Button
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            className="h-8 gap-1.5 text-xs bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black font-semibold"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Generate Credentials
          </Button>
        }
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Security Credentials Directory"
          description="Registry of all credential profiles registered to organizations."
          index={0}
        >
          {/* Search bar */}
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or NeoID..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / NeoID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organization Reference</TableHead>
                <TableHead>Access Role</TableHead>
                <TableHead>Biometrics</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/40">
                    <Loader2 className="h-5 w-5 animate-spin text-[#00E5A8] mr-2 inline" />
                    Loading credentials registry...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-white/40">
                    No matching users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any, i: number) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.015]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                          <User className="h-4 w-4 text-white/30" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white">{item.name || "Member User"}</p>
                          <p className="text-[10px] text-[#00E5A8] font-mono">{item.neoId || "NEO-PENDING"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-white/70">{item.email}</TableCell>
                    <TableCell className="text-xs text-white/50 font-mono">
                      {item.organization_id || "default"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${
                        item.identity_type === "admin"
                          ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {item.identity_type === "admin" ? "Org Admin" : "Member"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.face_embedding_id ? (
                          <span className="rounded bg-[#00E5A8]/10 border border-[#00E5A8]/15 px-1 py-0.5 text-[9.5px] text-[#00E5A8]">Face</span>
                        ) : (
                          <span className="text-white/20 text-[10px]">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/30 text-[11px]">
                      {safeFormatDistanceToNow(item.created_at)}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </ChartCard>
      </div>

      {/* Generate Credentials Modal */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-md bg-[#080808]/95 border-white/10 text-white backdrop-blur-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-white/90">
              <UserPlus className="h-4 w-4 text-[#00E5A8]" />
              Provision Account Credentials
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Generate credentials. Accounts are instantly added to Firebase Auth and Firestore.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerate} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/45">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="bg-white/[0.02] border-white/10 text-white focus-visible:ring-[#00E5A8]"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/45">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@company.com"
                className="bg-white/[0.02] border-white/10 text-white focus-visible:ring-[#00E5A8]"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-white/45">Password</label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[9.5px] text-[#00E5A8] hover:underline"
                  disabled={submitting}
                >
                  Generate Strong Password
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-white/[0.02] border-white/10 text-white pr-10 focus-visible:ring-[#00E5A8]"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/45">Role Tier</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0c0c0c] px-3 py-2 text-white focus:outline-none focus:border-[#00E5A8]"
                  disabled={submitting}
                >
                  <option value="member">Standard Member</option>
                  <option value="org_admin">Organization Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/45">Organization Space</label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0c0c0c] px-3 py-2 text-white focus:outline-none focus:border-[#00E5A8]"
                  disabled={submitting}
                >
                  <option value="">Select Tenant...</option>
                  {orgs.map((org: any) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsGenerateOpen(false)}
                className="h-8 text-xs text-white/50 hover:text-white"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-8 text-xs bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black font-semibold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Provisioning...
                  </>
                ) : (
                  "Generate & Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generated Credentials Success Sheet */}
      <Dialog open={successResult !== null} onOpenChange={(open) => !open && setSuccessResult(null)}>
        <DialogContent className="max-w-md bg-[#080808] border border-[#00E5A8]/20 text-white backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,229,168,0.07)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-[#00E5A8]">
              <CheckCircle2 className="h-4 w-4" />
              Credentials Provisioned Successfully!
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Copy this information before closing. The password cannot be recovered.
            </DialogDescription>
          </DialogHeader>

          {successResult && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-2.5">
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="text-white/45">Account Name</span>
                  <span className="font-semibold text-white">{successResult.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="text-white/45">Email Address</span>
                  <span className="font-mono text-white select-all">{successResult.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="text-white/45">Password</span>
                  <span className="font-mono text-[#00E5A8] font-bold select-all bg-[#00E5A8]/5 px-2 py-0.5 rounded border border-[#00E5A8]/10">
                    {successResult.password}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="text-white/45">Access Role</span>
                  <span className="font-semibold text-white">{successResult.role}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.03] pb-2">
                  <span className="text-white/45">Organization</span>
                  <span className="font-semibold text-white">{successResult.orgName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Permanent NeoID</span>
                  <span className="font-mono text-[#00E5A8] font-semibold">{successResult.neoId}</span>
                </div>
              </div>

              {/* QR code visualization */}
              <div className="flex flex-col items-center gap-2 border-t border-white/[0.06] pt-3.5">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">User Identification QR Code</p>
                <div className="h-24 w-24 bg-white p-1 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={successResult.qrCode} alt="QR Code" className="h-full w-full" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  onClick={handleCopyCredentials}
                  variant="outline"
                  className="h-8 text-xs border-white/10 text-white/70 hover:bg-white/[0.05]"
                >
                  {copied ? (
                    <>
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1.5 text-[#00E5A8]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy text
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSuccessResult(null)}
                  className="h-8 text-xs bg-[#00E5A8] hover:bg-[#00E5A8]/90 text-black font-semibold"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
