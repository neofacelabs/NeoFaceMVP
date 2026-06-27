"use client";

import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { useReportTemplates, useExportReport } from "@/lib/api";
import { FileDown, Calendar, Database, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ReportsPage() {
  const [selectedFormat, setSelectedFormat] = React.useState<Record<string, string>>({});
  
  const { data: templatesData, isLoading } = useReportTemplates();
  const exportMutation = useExportReport();

  const handleDownload = async (templateId: string) => {
    const format = selectedFormat[templateId] || "csv";
    const toastId = toast.loading(`Generating report for ${templateId}...`);
    try {
      const blob = await exportMutation.mutateAsync({ templateId, format });
      
      // Create download link in browser
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${templateId}-${new Date().toISOString().split("T")[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success("Report downloaded successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate and download report", { id: toastId });
    }
  };

  const templates = templatesData?.templates || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Reports"
        description="Download platform usage audits, biometric audit digests, and billing statements."
        breadcrumbs={[{ label: "Super Admin", href: "/super" }, { label: "Reports" }]}
      />

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-white/40">
          Loading templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl: any, i: number) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col justify-between rounded-xl border border-white/[0.065] bg-white/[0.025] p-5 shadow-sm hover:border-white/[0.1] hover:bg-white/[0.045] transition-all"
            >
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70">
                  {tpl.id.includes("auth") ? <Calendar className="h-5 w-5 text-sky-400" /> :
                   tpl.id.includes("billing") ? <FileSpreadsheet className="h-5 w-5 text-[#00E5A8]" /> :
                   <ShieldAlert className="h-5 w-5 text-red-400" />}
                </div>
                <h3 className="text-sm font-semibold text-white">{tpl.name}</h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed min-h-[48px]">{tpl.description}</p>
              </div>

              <div className="mt-5 space-y-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">Export Format</span>
                  <select
                    value={selectedFormat[tpl.id] || "csv"}
                    onChange={(e) => setSelectedFormat(prev => ({ ...prev, [tpl.id]: e.target.value }))}
                    className="rounded bg-[#0c0c0c] border border-white/10 px-2 py-1 text-white/70 focus:outline-none"
                  >
                    <option value="csv">CSV (Spreadsheet)</option>
                    <option value="json">JSON raw</option>
                  </select>
                </div>

                <Button
                  onClick={() => handleDownload(tpl.id)}
                  size="sm"
                  className="w-full gap-1.5 h-8 text-xs bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-white/20"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Generate & Download
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
