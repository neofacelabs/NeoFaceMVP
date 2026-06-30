"use client";
import { usePlatformStore } from '@/store/platform';

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Search, WifiOff, Wifi, AlertCircle, Wrench } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/types/platform";

const deviceTypeLabel: Record<string, string> = {
  face_camera: "Face Camera",
  fingerprint_scanner: "Fingerprint",
  turnstile: "Turnstile",
  gate_controller: "Gate Controller",
  edge_device: "Edge Device",
  iot_sensor: "IoT Sensor",
  attendance_terminal: "Terminal",
};

const statusIcon: Record<DeviceStatus, React.ElementType> = {
  online: Wifi,
  offline: WifiOff,
  warning: AlertCircle,
  maintenance: Wrench,
};

import { webAuthnApi } from "@/lib/api";

export default function DevicesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const { projectId } = React.use(params);
  const [search, setSearch] = React.useState("");
  const [devices, setDevices] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function loadDevices() {
      try {
        const { data } = await webAuthnApi.listDevices();
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            id: item.id || item.credential_id,
            name: item.device_name || "WebAuthn Token",
            serial_number: (item.credential_id || "").slice(0, 16),
            type: "edge_device",
            location: "Authorized Client Portal",
            status: "online" as const,
            auth_count_today: 0,
            uptime_pct: 100.0,
            firmware_version: "1.0.0",
            last_sync_at: item.created_at || new Date().toISOString(),
          }));
          
          setDevices(mapped);
        }
      } catch (err) {
        console.error("Failed to load WebAuthn devices:", err);
      }
    }
    loadDevices();
  }, []);

  const filtered = devices.filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase()) : true
  );

  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.filter((d) => d.status === "offline").length;
  const warning = devices.filter((d) => d.status === "warning").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devices"
        description="Gate cameras, fingerprint scanners, and edge devices in this project."
        breadcrumbs={[
          { label: "IIT Delhi Campus", href: `/org-admin/projects/${projectId}` },
          { label: "Devices" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync All
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Device
            </Button>
          </div>
        }
      />

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Online", value: online, color: "text-[#00E5A8]", bg: "bg-[#00E5A8]/[0.06] border-[#00E5A8]/15" },
          { label: "Offline", value: offline, color: "text-[#f87171]", bg: "bg-[#f87171]/[0.06] border-[#f87171]/15" },
          { label: "Warning", value: warning, color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/[0.06] border-[#fbbf24]/15" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={cn("rounded-[12px] border p-4", stat.bg)}
          >
            <p className="kpi-label mb-1">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Devices table */}
      <ChartCard title="All Devices" index={0} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search devices..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Auth Today</TableHead>
              <TableHead className="text-right">Uptime</TableHead>
              <TableHead>Firmware</TableHead>
              <TableHead>Last Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((device, i) => {
              const StatusIcon = (statusIcon as any)[device.status] || Wifi;
              return (
                <motion.tr
                  key={device.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer"
                >
                  <TableCell>
                    <div>
                      <p className="text-[12.5px] font-semibold text-white/85">{device.name}</p>
                      <p className="font-mono text-[10px] text-white/25">{device.serial_number}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11.5px] text-white/50">
                    {deviceTypeLabel[device.type] ?? device.type}
                  </TableCell>
                  <TableCell className="text-[11.5px] text-white/55">{device.location}</TableCell>
                  <TableCell>
                    <StatusBadge variant="device" status={device.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px] text-white/60">
                    {device.auth_count_today.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn("text-[12px] font-semibold", device.uptime_pct >= 99 ? "text-[#00E5A8]" : device.uptime_pct >= 95 ? "text-[#fbbf24]" : "text-[#f87171]")}>
                      {device.uptime_pct.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-white/35">v{device.firmware_version}</TableCell>
                  <TableCell className="text-[11px] text-white/30 whitespace-nowrap">
                    {formatDistanceToNow(new Date(device.last_sync_at), { addSuffix: true })}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
