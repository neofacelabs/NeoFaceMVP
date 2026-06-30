"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Fingerprint,
  Camera,
  Key,
  Shield,
  Trash2,
  Edit2,
  Plus,
  Loader2,
  Laptop,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Wallet
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { biometricsApi, webAuthnApi } from "@/lib/api";
import { toast } from "sonner";

// Base64url converters
function base64urlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default function MemberSecurityPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [bioStatus, setBioStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rename Dialog
  const [renameDevice, setRenameDevice] = useState<any | null>(null);
  const [newName, setNewName] = useState("");

  // Add Passkey Flow
  const [addingPasskey, setAddingPasskey] = useState(false);

  async function loadData() {
    try {
      const [devicesRes, bioRes] = await Promise.all([
        webAuthnApi.listDevices().catch(() => ({ data: { devices: [] } })),
        biometricsApi.getStatus().catch(() => ({ data: {} })),
      ]);
      setDevices(devicesRes.data?.devices || []);
      setBioStatus(bioRes.data || {});
    } catch (err) {
      console.error("Failed to load security options:", err);
      toast.error("Failed to load security settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterPasskey = async () => {
    try {
      setAddingPasskey(true);
      // Step 1: get registration begin response
      const res = await webAuthnApi.registerBegin();
      const options = res.data;

      // Map base64 strings back to ArrayBuffer/Uint8Arrays as required by standard WebAuthn API
      options.challenge = base64urlToBytes(options.challenge);
      options.user.id = base64urlToBytes(options.user.id);
      
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlToBytes(cred.id),
        }));
      }

      // Step 2: Trigger browser registration prompt
      const credential = (await navigator.credentials.create({
        publicKey: options,
      })) as any;

      if (!credential) {
        throw new Error("Passkey scanner did not return a valid credential.");
      }

      // Step 3: Complete registration (serialize credential parameters back to base64url)
      const response = {
        clientDataJSON: bytesToBase64url(credential.response.clientDataJSON),
        attestationObject: bytesToBase64url(credential.response.attestationObject),
      };

      const completeBody = {
        credential_id: credential.id,
        raw_id: bytesToBase64url(credential.rawId),
        response,
        type: credential.type,
        device_name: `${navigator.userAgent.includes("Mac") ? "Apple Touch ID" : "Windows Hello"} Security Key`,
      };

      await webAuthnApi.registerComplete(completeBody);
      toast.success("Security Passkey registered successfully!");
      await loadData();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || err.response?.data?.detail || "Passkey registration failed.";
      toast.error(msg);
    } finally {
      setAddingPasskey(false);
    }
  };

  const handleRename = async () => {
    if (!renameDevice || !newName.trim()) return;
    try {
      setActionLoading(`rename-${renameDevice.credential_id}`);
      await webAuthnApi.renameDevice(renameDevice.credential_id, newName);
      toast.success("Device renamed successfully.");
      setRenameDevice(null);
      await loadData();
    } catch {
      toast.error("Failed to rename device.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (credId: string) => {
    if (!confirm("Are you sure you want to revoke this passkey? You won't be able to log in with this key anymore.")) return;
    try {
      setActionLoading(`revoke-${credId}`);
      await webAuthnApi.revokeDevice(credId);
      toast.success("Security key revoked successfully.");
      await loadData();
    } catch {
      toast.error("Failed to revoke security key.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePayments = async (credId: string, currentVal: boolean) => {
    try {
      setActionLoading(`payment-${credId}`);
      await webAuthnApi.togglePayments(credId, !currentVal);
      toast.success(`Payment signing ${!currentVal ? "enabled" : "disabled"} for this device.`);
      await loadData();
    } catch {
      toast.error("Failed to toggle payment configurations.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBiometric = async (type: "face" | "iris" | "fingerprint") => {
    const labels = { face: "face embeddings", iris: "iris scans", fingerprint: "fingerprint templates" };
    if (!confirm(`Are you sure you want to completely erase your ${labels[type]}? You will need to re-enroll to use this verification method.`)) return;
    
    try {
      setActionLoading(`delete-${type}`);
      if (type === "face") await biometricsApi.deleteFace();
      else if (type === "iris") await biometricsApi.deleteIris();
      else if (type === "fingerprint") await biometricsApi.deleteFingerprint();
      
      toast.success(`Enrolled ${type} biometric credentials cleared.`);
      await loadData();
    } catch {
      toast.error(`Failed to delete ${type} records.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5A8]" />
      </div>
    );
  }

  // Count active credentials
  const hasFace = bioStatus?.face?.enrolled || false;
  const hasFingerprint = bioStatus?.fingerprint?.enrolled || false;
  const hasIris = bioStatus?.iris?.enrolled || false;
  const passkeyCount = devices.length;

  let score = 25;
  if (hasFace) score += 25;
  if (hasFingerprint) score += 25;
  if (passkeyCount > 0) score += 25;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Passkeys"
        description="Manage enrolled WebAuthn passkeys, hardware keys, and biometrics control center."
        breadcrumbs={[
          { label: "Member Portal", href: "/me" },
          { label: "Security Settings" }
        ]}
      />

      <KPIGrid columns={3}>
        <KPICard label="Registered Passkeys" value={passkeyCount} index={0} />
        <KPICard label="Enrolled Biometrics" value={[hasFace, hasFingerprint, hasIris].filter(Boolean).length} index={1} />
        <KPICard 
          label="MFA Protection Level" 
          value={score === 100 ? "Maximum" : score >= 75 ? "High" : score >= 50 ? "Moderate" : "Basic"} 
          color={score >= 75 ? "success" : score >= 50 ? "warning" : "error"}
          index={2} 
        />
      </KPIGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Passkeys column */}
        <div className="lg:col-span-2 space-y-6">
          <ChartCard
            title="Hardware Security Keys & Passkeys"
            description="Cryptographically signed hardware keys and device biometrics stored in your browser."
            index={0}
            className="h-full"
            action={
              <Button 
                size="sm" 
                onClick={handleRegisterPasskey}
                disabled={addingPasskey}
                className="h-8 gap-1 text-[11px]"
              >
                {addingPasskey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Security Key
              </Button>
            }
          >
            <div className="space-y-3.5 mt-2">
              {devices.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/35 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                  <Key className="mx-auto h-5 w-5 text-white/20 mb-2" />
                  No security passkeys enrolled. Register one to bypass passwords completely.
                </div>
              ) : (
                devices.map((dev) => (
                  <div 
                    key={dev.credential_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-white/[0.045] bg-white/[0.015] gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] shrink-0 text-white/50">
                        <Laptop className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-semibold text-white/90 truncate">{dev.device_name}</span>
                          {dev.is_active && (
                            <span className="rounded bg-[#00E5A8]/10 border border-[#00E5A8]/20 px-1.5 py-0.5 text-[8.5px] font-semibold text-[#00E5A8] uppercase tracking-wider select-none">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 truncate mt-0.5 font-mono max-w-[200px] sm:max-w-xs">
                          ID: {dev.credential_id}
                        </p>
                        <p className="text-[9.5px] text-white/40 mt-1">
                          Enrolled {dev.created_at ? formatDistanceToNow(new Date(dev.created_at), { addSuffix: true }) : "recently"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-white/[0.03] pt-3 sm:pt-0">
                      {/* Payment signing switch */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-[10px] font-medium text-white/70 flex items-center gap-1 justify-end">
                            <Wallet className="h-3 w-3 text-white/40" />
                            Payments
                          </p>
                          <p className="text-[8px] text-white/30">Biometric sign-off</p>
                        </div>
                        <Switch
                          checked={dev.payments_enabled || false}
                          disabled={actionLoading === `payment-${dev.credential_id}`}
                          onCheckedChange={() => handleTogglePayments(dev.credential_id, dev.payments_enabled)}
                          className="data-[state=checked]:bg-[#00E5A8]"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 border-l border-white/[0.05] pl-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
                          onClick={() => {
                            setRenameDevice(dev);
                            setNewName(dev.device_name);
                          }}
                          disabled={actionLoading !== null}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#f87171]/40 hover:text-[#f87171] hover:bg-[#f87171]/5"
                          onClick={() => handleRevoke(dev.credential_id)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === `revoke-${dev.credential_id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>

        {/* Biometrics Reset Control Center */}
        <div className="space-y-6">
          <ChartCard
            title="Biometric Reset Center"
            description="Manage or clear your server-side face models and biometrics."
            index={1}
          >
            <div className="space-y-4 mt-2">
              
              {/* Face Biometric */}
              <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4.5 w-4.5 text-[#00E5A8]/70" />
                    <div>
                      <h5 className="text-[12px] font-semibold text-white/85">Face Recognition</h5>
                      <p className="text-[9.5px] text-white/30">Vector embeddings checks</p>
                    </div>
                  </div>
                  {hasFace ? (
                    <span className="rounded bg-[#00E5A8]/10 border border-[#00E5A8]/20 px-2 py-0.5 text-[9px] font-medium text-[#00E5A8]">
                      Enrolled
                    </span>
                  ) : (
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-medium text-white/30">
                      Pending
                    </span>
                  )}
                </div>
                {hasFace && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-3 h-7 text-[10.5px] text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/5 gap-1.5"
                    disabled={actionLoading !== null}
                    onClick={() => handleDeleteBiometric("face")}
                  >
                    {actionLoading === "delete-face" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Erase Face Data
                  </Button>
                )}
              </div>

              {/* Fingerprint Biometric */}
              <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4.5 w-4.5 text-[#38BDF8]/70" />
                    <div>
                      <h5 className="text-[12px] font-semibold text-white/85">Fingerprint Templates</h5>
                      <p className="text-[9.5px] text-white/30">Local security tokens</p>
                    </div>
                  </div>
                  {hasFingerprint ? (
                    <span className="rounded bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-2 py-0.5 text-[9px] font-medium text-[#38BDF8]">
                      Enrolled
                    </span>
                  ) : (
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-medium text-white/30">
                      Pending
                    </span>
                  )}
                </div>
                {hasFingerprint && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-3 h-7 text-[10.5px] text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/5 gap-1.5"
                    disabled={actionLoading !== null}
                    onClick={() => handleDeleteBiometric("fingerprint")}
                  >
                    {actionLoading === "delete-fingerprint" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Erase Fingerprint
                  </Button>
                )}
              </div>

              {/* Iris Biometric */}
              <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-purple-400/70" />
                    <div>
                      <h5 className="text-[12px] font-semibold text-white/85">Iris Scan</h5>
                      <p className="text-[9.5px] text-white/30">High-security scanning</p>
                    </div>
                  </div>
                  {hasIris ? (
                    <span className="rounded bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 text-[9px] font-medium text-purple-400">
                      Enrolled
                    </span>
                  ) : (
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-medium text-white/30">
                      Pending
                    </span>
                  )}
                </div>
                {hasIris && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-3 h-7 text-[10.5px] text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/5 gap-1.5"
                    disabled={actionLoading !== null}
                    onClick={() => handleDeleteBiometric("iris")}
                  >
                    {actionLoading === "delete-iris" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Erase Iris Scan
                  </Button>
                )}
              </div>

            </div>
          </ChartCard>
        </div>

      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDevice !== null} onOpenChange={(open) => !open && setRenameDevice(null)}>
        <DialogContent className="max-w-xs bg-[#0c0c0c] border-white/10 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xs font-semibold text-white/85">Rename Security Key</DialogTitle>
            <DialogDescription className="text-[10px] text-white/35">
              Choose a custom nickname for this hardware credential.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-1.5">
            <label className="text-[9.5px] text-white/40 font-medium">Device Label</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. My Macbook Touch ID"
              className="h-8 bg-white/[0.03] border-white/10 text-xs text-white"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameDevice(null)}
              className="h-7 text-[10px] border-white/10 text-white/60 hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRename}
              disabled={actionLoading !== null || !newName.trim()}
              className="h-7 text-[10px]"
            >
              {actionLoading?.startsWith("rename-") && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Save Nickname
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
