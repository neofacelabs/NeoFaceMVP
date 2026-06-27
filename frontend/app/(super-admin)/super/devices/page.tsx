"use client";

import React from "react";
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
import { useDevices, useUpdateDevice, useDeleteDevice } from "@/lib/api";
import { Plus, Search, MoreHorizontal, AlertTriangle, ShieldCheck, Trash2, Heart, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DevicesPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [typeFilter, setTypeFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const { data, isLoading } = useDevices(page, 50, typeFilter || undefined, statusFilter || undefined, search || undefined);
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();

  const handlePing = async (deviceId: string) => {
    try {
      await updateMutation.mutateAsync({ deviceId, payload: { last_heartbeat: new Date().toISOString() } });
      toast.success("Device pinged successfully; status is online");
    } catch (err) {
      toast.error("Failed to ping device");
    }
  };

  const handleDelete = async (deviceId: string) => {
    if (!confirm("Are you sure you want to de-register this device from the platform control center?")) return;
    try {
      await deleteMutation.mutateAsync(deviceId);
      toast.success("Device de-registered successfully");
    } catch (err) {
      toast.error("Failed to de-register device");
    }
  };

  const devices = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware Devices"
        description="Manage connected camera turnstiles, fingerprint terminals, and biometric edge gateways."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Devices" }]}
        actions={
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Register Device
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Hardware", value: total, color: "text-white" },
          { label: "Online Gateway", value: devices.filter((d: any) => d.status === "online").length, color: "text-[#00E5A8]" },
          { label: "Degraded / Check Needed", value: devices.filter((d: any) => d.status === "degraded").length, color: "text-[#fbbf24]" },
          { label: "Offline Devices", value: devices.filter((d: any) => d.status === "offline").length, color: "text-red-400" },
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
      <ChartCard title="Hardware Device Registry" description="View hardware telemetry logs, battery health, and assignments." index={0}>
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search devices by name or IP..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="face_camera">Face Camera</option>
              <option value="fingerprint_reader">Fingerprint Reader</option>
              <option value="turnstile">Turnstile Gate</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-1.5 text-xs text-white/70 focus:outline-none"
            >
              <option value="">All Telemetries</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="degraded">Degraded</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            Loading devices telemetry...
          </div>
        ) : devices.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-white/40">
            No hardware devices registered yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hardware Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Firmware</TableHead>
                <TableHead className="text-right">Health Score</TableHead>
                <TableHead className="text-right">Battery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Heartbeat</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device: any) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-white">{device.name}</p>
                      <p className="text-[10px] text-white/40">ID: {device.id.slice(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-white/75 capitalize">{device.type.replace("_", " ")}</TableCell>
                  <TableCell className="text-xs text-white/60 font-mono">{device.ip_address || "None Assigned"}</TableCell>
                  <TableCell className="text-xs text-white/60">{device.firmware_version}</TableCell>
                  <TableCell className={cn(
                    "text-right font-semibold text-xs",
                    device.health_score > 90 ? "text-emerald-400" :
                    device.health_score > 70 ? "text-yellow-400" :
                    "text-red-400"
                  )}>
                    {device.health_score}%
                  </TableCell>
                  <TableCell className="text-right text-xs text-white/70">
                    {device.battery_level !== null && device.battery_level !== undefined ? `${device.battery_level}%` : "Mains Powered"}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                      device.status === "online" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                      device.status === "degraded" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400" :
                      "border-red-500/20 bg-red-500/10 text-red-400"
                    )}>
                      {device.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-white/45">
                    {device.last_heartbeat ? formatDistanceToNow(new Date(device.last_heartbeat), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:bg-white/5 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[150px] border-white/[0.08] bg-[#0c0c0c] text-white">
                        <DropdownMenuItem onClick={() => handlePing(device.id)} className="gap-2 text-xs focus:bg-white/5 focus:text-white">
                          <RefreshCw className="h-3.5 w-3.5 text-[#00E5A8]" />
                          Ping Heartbeat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(device.id)} className="gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                          De-Register
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>
    </div>
  );
}
