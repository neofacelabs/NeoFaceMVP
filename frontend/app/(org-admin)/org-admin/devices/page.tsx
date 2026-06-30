"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice, useRebootDevice } from "@/lib/api/devices";
import { useSites } from "@/lib/api/sites";
import { useProjects } from "@/lib/api/projects";
import { Button } from "@/components/ui/button";
import { HardDrive, Plus, Trash2, Loader2, Check, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function DevicesPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  
  const [page, setPage] = useState(1);
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: devicesData, isLoading, refetch } = useDevices(
    page,
    50,
    undefined,
    statusFilter || undefined,
    search || undefined
  );
  
  const { data: sitesData } = useSites();
  const { data: projectsData } = useProjects(1, 100);
  const createDeviceMutation = useCreateDevice();
  const updateDeviceMutation = useUpdateDevice();
  const deleteDeviceMutation = useDeleteDevice();
  const rebootDeviceMutation = useRebootDevice();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("face_camera");
  const [ipAddress, setIpAddress] = useState("");
  const [selSite, setSelSite] = useState("");
  const [selProj, setSelProj] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createDeviceMutation.mutateAsync({
        name,
        type,
        ip_address: ipAddress || undefined,
        site_id: selSite || undefined,
        application_id: selProj || undefined,
      });
      toast.success("Device paired successfully!");
      setName("");
      setIpAddress("");
      setIsRegisterOpen(false);
      refetch();
    } catch {
      toast.error("Failed to pair hardware device.");
    }
  };

  const handleReboot = async (id: string) => {
    try {
      await rebootDeviceMutation.mutateAsync(id);
      toast.success("Reboot signal delivered successfully!");
      refetch();
    } catch {
      toast.error("Failed to trigger reboot.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to unpair/deregister this hardware device?")) {
      await deleteDeviceMutation.mutateAsync(id);
      toast.success("Device removed.");
      refetch();
    }
  };

  const devices = (devicesData?.items || []).filter((d: any) => !siteFilter || d.site_id === siteFilter);
  const sites = sitesData?.items || [];
  const projects = projectsData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware Devices"
        description="Provision camera nodes, biometric scanners, and authorize access terminals at physical entry points."
        breadcrumbs={[{ label: "Organization" }, { label: "Devices" }]}
        actions={
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Pair Device
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/[0.08] bg-[#0c0c0c] text-white">
              <DialogHeader>
                <DialogTitle className="text-sm font-semibold text-white/90">Pair Hardware Device</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Device Label Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Front Gate Camera 1, Lobby Reader"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Device Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="face_camera">Face Verification Camera</option>
                    <option value="fingerprint_reader">Fingerprint Reader</option>
                    <option value="iris_scanner">Iris Scanner</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">IP Address</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="e.g. 192.168.1.50"
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#00E5A8]/30 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Physical Site Assignment</label>
                  <select
                    value={selSite}
                    onChange={(e) => setSelSite(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="">Select Site</option>
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id} className="bg-[#0c0c0c]">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/40">Workspace Project Scope</label>
                  <select
                    value={selProj}
                    onChange={(e) => setSelProj(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 focus:border-[#00E5A8]/30 focus:outline-none"
                  >
                    <option value="">Select Project Scope</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id} className="bg-[#0c0c0c]">{p.name}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)} className="border-white/10 text-white/60 hover:bg-white/[0.05]">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createDeviceMutation.isPending}>
                    {createDeviceMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Pair Hardware
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] pb-4">
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Sites</option>
          {sites.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5A8]" />
        </div>
      ) : devices.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] py-16 text-center">
          <HardDrive className="mx-auto h-8 w-8 text-white/20 mb-3" />
          <p className="text-xs text-white/40">No hardware devices matched your parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device: any, i: number) => {
            const site = sites.find((s: any) => s.id === device.site_id);
            const project = projects.find((p: any) => p.id === device.application_id);
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                      <HardDrive className="h-4 w-4 text-[#00E5A8]" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-white/90">{device.name}</h3>
                      <p className="text-[10.5px] text-white/35 capitalize">{device.type.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleReboot(device.id)}
                      title="Reboot device"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      title="Remove device"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.05] bg-white/[0.02] text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 text-[11px] text-white/50 space-y-1">
                  <p>IP Address: {device.ip_address || "DHCP Address"}</p>
                  <p>Firmware: v{device.firmware_version || "1.0.0"}</p>
                  {site && <p className="text-[#00E5A8]/80 font-medium">Site: {site.name}</p>}
                  {project && <p className="text-sky-400/80 font-medium">Project: {project.name}</p>}
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${device.status === "online" ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400" : "border-white/10 bg-white/5 text-white/30"}`}>
                    <span className={`h-1 w-1 rounded-full ${device.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                    {device.status}
                  </span>
                  <span className="text-[10px] text-white/20">
                    Health: {device.health_score}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
