"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, MinusCircle, Cpu, Server, HardDrive, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function InfrastructurePage() {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["admin", "infra-metrics"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/infrastructure");
      return data;
    },
  });

  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ["admin", "infra-services"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/infrastructure/services");
      return data;
    },
  });

  const handleRefresh = () => {
    refetchMetrics();
    refetchServices();
    toast.success("Infrastructure stats updated");
  };

  const statusIcon = (status: string) => {
    if (status === "operational" || status === "healthy") {
      return <CheckCircle2 className="h-4 w-4 text-[#00E5A8] shrink-0" />;
    }
    if (status === "degraded") {
      return <AlertCircle className="h-4 w-4 text-[#fbbf24] shrink-0" />;
    }
    return <MinusCircle className="h-4 w-4 text-[#f87171] shrink-0" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Infrastructure Monitor"
        description="Full-stack container telemetry, database connections count, and Celery job worker pool health."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Infrastructure" }]}
        actions={
          <Button onClick={handleRefresh} size="sm" variant="outline" className="h-8 gap-1.5 text-xs bg-white/5 border-white/10 hover:bg-white/10">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Telemetry
          </Button>
        }
      />

      {/* KPI Cards */}
      <KPIGrid>
        <KPICard
          label="API Node CPU Load"
          value={metrics ? `${metrics.cpu_usage.toFixed(1)}%` : "0%"}
          color={metrics?.cpu_usage > 80 ? "warning" : "default"}
        />
        <KPICard
          label="Memory Usage Ratio"
          value={metrics ? `${metrics.memory_usage.toFixed(1)}%` : "0%"}
        />
        <KPICard
          label="Celery Queue Depth"
          value={metrics ? metrics.queue_depth.toString() : "0"}
          color={metrics?.queue_depth > 100 ? "warning" : "default"}
        />
        <KPICard
          label="GPU Core Temperature"
          value={metrics ? `${metrics.gpu_temp.toFixed(0)}°C` : "0°C"}
          color={metrics?.gpu_temp > 82 ? "warning" : "success"}
        />
      </KPIGrid>

      {/* Services Health and Telemetry details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Services Status Table */}
        <div className="lg:col-span-2">
          <ChartCard title="Platform Core Services Health" description="Status check of microservices and infrastructure backends." index={0}>
            {servicesLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/40">Loading service checks...</div>
            ) : !services ? (
              <div className="flex h-32 items-center justify-center text-sm text-white/45">No health data returned.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Component</TableHead>
                    <TableHead>Address / Uri</TableHead>
                    <TableHead className="text-right">Latency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((svc: any) => (
                    <TableRow key={svc.service}>
                      <TableCell className="font-semibold text-white text-xs flex items-center gap-2">
                        {svc.service === "postgres" ? <Server className="h-3.5 w-3.5 text-blue-400" /> :
                         svc.service === "redis" ? <HardDrive className="h-3.5 w-3.5 text-red-400" /> :
                         <Cpu className="h-3.5 w-3.5 text-indigo-400" />}
                        <span className="capitalize">{svc.service}</span>
                      </TableCell>
                      <TableCell className="text-xs text-white/60 font-mono">
                        {svc.service === "postgres" ? "postgresql://supabase-db:5432" :
                         svc.service === "redis" ? "redis://redis-broker:6379" :
                         "celery://rabbitmq-worker:5672"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs text-white/80">
                        {svc.latency_ms ? `${svc.latency_ms.toFixed(1)} ms` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          {statusIcon(svc.status)}
                          <span className={cn(
                            "capitalize font-medium",
                            svc.status === "healthy" ? "text-emerald-400" :
                            svc.status === "degraded" ? "text-yellow-400" :
                            "text-red-400"
                          )}>{svc.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </div>

        {/* Database Connection Pool Status */}
        <div>
          <ChartCard title="Database Telemetry" description="Active Postgres connection pools count." index={1}>
            <div className="space-y-4">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Active DB Connections</p>
                <p className="text-3xl font-extrabold text-[#00E5A8] mt-1">12</p>
                <p className="text-[10px] text-white/35 mt-1">Max capacity: 100 connections</p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Redis Memory Allocated</p>
                <p className="text-3xl font-extrabold text-sky-400 mt-1">15.4 MB</p>
                <p className="text-[10px] text-white/35 mt-1">Cache Eviction Strategy: volatile-lru</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
