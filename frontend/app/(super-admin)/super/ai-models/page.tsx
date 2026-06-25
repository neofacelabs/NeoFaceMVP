"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { mockAIModels } from "@/lib/mock-data/super-admin";
import { Brain, CheckCircle2, Clock, FlaskConical, XCircle, Cpu, Zap, Database } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ModelStatus } from "@/types/platform";

const statusConfig: Record<ModelStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  production: { label: "Production", color: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20", icon: CheckCircle2 },
  beta: { label: "Beta", color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20", icon: FlaskConical },
  testing: { label: "Testing", color: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20", icon: Clock },
  deprecated: { label: "Deprecated", color: "text-white/30 bg-white/[0.03] border-white/[0.07]", icon: XCircle },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  face_recognition: Brain,
  liveness: Zap,
  fingerprint: Cpu,
  deepfake: FlaskConical,
  emotion: Database,
};

import { apiClient } from "@/lib/api";

export default function AIModelsPage() {
  const [models, setModels] = React.useState<any[]>(mockAIModels);

  React.useEffect(() => {
    async function loadModels() {
      try {
        const { data } = await apiClient.get("/admin/models");
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => {
            // Find a mock item with matching name or default
            const mock = mockAIModels.find(
              (m) => m.name.toLowerCase().includes(item.model_name.toLowerCase()) || 
                     m.type.toLowerCase().includes(item.model_name.toLowerCase())
            ) || mockAIModels[0];

            return {
              id: item.id,
              name: item.model_name.replace(/_/g, " "),
              version: item.version,
              accuracy: item.accuracy || mock.accuracy,
              latency_ms: item.latency_ms || mock.latency_ms,
              status: item.status as ModelStatus,
              type: mock.type,
              model_size_mb: mock.model_size_mb,
              description: mock.description,
            };
          });
          setModels(mapped);
        }
      } catch (err) {
        console.error("Failed to load backend AI models:", err);
      }
    }
    loadModels();
  }, []);

  const productionModels = models.filter((m) => m.status === "production");
  const betaModels = models.filter((m) => m.status === "beta");
  
  const avgAccuracy = productionModels.length > 0 
    ? (productionModels.reduce((acc, m) => acc + m.accuracy, 0) / productionModels.length).toFixed(1)
    : "99.2";

  const avgLatency = productionModels.length > 0
    ? Math.round(productionModels.reduce((acc, m) => acc + m.latency_ms, 0) / productionModels.length)
    : 45;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Models"
        description="Deployed machine learning models powering NeoFace's biometric intelligence."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "AI Models" }]}
      />

      <KPIGrid columns={4}>
        {[
          { label: "Production Models", value: productionModels.length, color: "success" as const },
          { label: "Beta Models", value: betaModels.length, color: "accent" as const },
          { label: "Avg Accuracy", value: `${avgAccuracy}%`, color: "success" as const },
          { label: "Avg Latency", value: `${avgLatency}ms`, color: "default" as const },
        ].map((kpi, i) => <KPICard key={kpi.label} {...kpi} index={i} />)}
      </KPIGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {models.map((model, i) => {
          const StatusIcon = (statusConfig as any)[model.status]?.icon || Brain;
          const TypeIcon = (typeIcons as any)[model.type] ?? Brain;
          const accuracyPct = model.accuracy;

          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-white/10 hover:shadow-card"
            >
              {/* Top shine */}
              <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/08 to-transparent" />

              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5A8]/[0.07] border border-[#00E5A8]/15">
                    <TypeIcon className="h-4 w-4 text-[#00E5A8]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white/90">{model.name}</p>
                    <p className="text-[10.5px] text-white/35">v{model.version} · {model.model_size_mb}MB</p>
                  </div>
                </div>
                <span className={cn("flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold", (statusConfig as any)[model.status]?.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {(statusConfig as any)[model.status]?.label}
                </span>
              </div>

              <p className="mb-4 text-[11.5px] text-white/40 leading-relaxed">{model.description}</p>

              {/* Metrics */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/35">Accuracy</span>
                  <span className="font-semibold text-[#00E5A8]">{model.accuracy}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracyPct}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#00E5A8] to-[#14F1D9]"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/[0.03] px-2.5 py-2">
                    <p className="text-[9.5px] uppercase tracking-wider text-white/25">Latency</p>
                    <p className="text-[13px] font-bold text-white/70">{model.latency_ms}ms</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-2.5 py-2">
                    <p className="text-[9.5px] uppercase tracking-wider text-white/25">Type</p>
                    <p className="text-[11px] font-semibold text-white/70 truncate">{model.type.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
