"use client";
import { usePlatformStore } from '@/store/platform';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { BarChart3, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function OrganizationReportsPage() {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const [downloading, setDownloading] = useState<string | null>(null);

  const templates = [
    {
      id: "auth-activity-summary",
      name: "Authentication Activity Summary",
      description: "Daily statistics for biometric verifications within your organization.",
      format: "csv"
    },
    {
      id: "identities-list",
      name: "Identities Directory",
      description: "List of all enrolled identities with type and site affiliations.",
      format: "csv"
    },
    {
      id: "devices-list",
      name: "Hardware Device Inventory",
      description: "Inventory list of all edge camera nodes and fingerprint readers.",
      format: "csv"
    }
  ];

  const handleExport = async (templateId: string) => {
    try {
      setDownloading(templateId);
      const token = localStorage.getItem("bioid_access_token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${apiBase}/api/v1/reports/export?template_id=${templateId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Failed to export");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${templateId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Report downloaded successfully!");
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Reports"
        description="Generate audit trails, export enrollment directories, and review security logs for compliance audits."
        breadcrumbs={[{ label: "Organization" }, { label: "Reports" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5 transition-all hover:border-[#00E5A8]/20 hover:shadow-card"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-[#00E5A8]/[0.07] border-[#00E5A8]/15">
                <FileSpreadsheet className="h-4 w-4 text-[#00E5A8]" />
              </div>
              <h3 className="text-[13.5px] font-semibold text-white/90">{tpl.name}</h3>
            </div>
            
            <p className="text-xs text-white/50 min-h-[48px] mb-4">
              {tpl.description}
            </p>

            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
              <span className="text-[10px] text-white/25 uppercase font-bold tracking-wider">
                Format: {tpl.format}
              </span>
              <Button
                size="sm"
                onClick={() => handleExport(tpl.id)}
                disabled={downloading === tpl.id}
                className="h-8 gap-1.5 text-xs bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white"
              >
                {downloading === tpl.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                Export
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
