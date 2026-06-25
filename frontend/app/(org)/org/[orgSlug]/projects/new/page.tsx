"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { FolderKanban, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = React.use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [allowedDomains, setAllowedDomains] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [rateLimit, setRateLimit] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        environment,
        description: description.trim() || null,
        allowed_origins: allowedOrigins
          ? allowedOrigins.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        allowed_domains: allowedDomains
          ? allowedDomains.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        webhook_url: webhookUrl.trim() || null,
        rate_limit: Number(rateLimit) || 100,
      };

      await apiClient.post("/projects", payload);
      toast.success(`Project "${name}" created successfully!`);
      router.push(`/org/${orgSlug}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New Project"
        description="Provision a new tenant environment and credential scope for identity verification."
        breadcrumbs={[
          { label: "Dashboard", href: `/org/${orgSlug}` },
          { label: "Projects", href: `/org/${orgSlug}` },
          { label: "Create" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChartCard
          title="Project Credentials & Configuration"
          description="Define the operating constraints and validation keys for your application."
          index={0}
        >
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                Project Name
              </label>
              <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 focus-within:border-[#00E5A8]/30">
                <FolderKanban className="h-4 w-4 text-white/20" />
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Delhi Campus Security"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                Description
              </label>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 focus-within:border-[#00E5A8]/30">
                <textarea
                  placeholder="Describe this project's biometric purpose..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/20 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Environment */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                  Environment
                </label>
                <div className="rounded-lg border border-white/[0.07] bg-[#0c0c0c] px-3 py-2">
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-transparent text-[13px] text-white outline-none [&>option]:bg-[#0c0c0c]"
                  >
                    <option value="production">Production</option>
                    <option value="development">Development</option>
                    <option value="sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              {/* Rate Limit */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                  Rate Limit (requests / min)
                </label>
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    value={rateLimit}
                    onChange={(e) => setRateLimit(Number(e.target.value))}
                    className="w-full bg-transparent text-[13px] text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Allowed Origins */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                Allowed CORS Origins (comma-separated)
              </label>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 focus-within:border-[#00E5A8]/30">
                <input
                  type="text"
                  placeholder="https://app.example.com, https://api.example.com"
                  value={allowedOrigins}
                  onChange={(e) => setAllowedOrigins(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            {/* Allowed Domains */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                Allowed Domains / Hostnames (comma-separated)
              </label>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 focus-within:border-[#00E5A8]/30">
                <input
                  type="text"
                  placeholder="example.com, auth.example.com"
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <label className="text-[11.5px] font-semibold uppercase tracking-wider text-white/40">
                Audit Log Webhook URL
              </label>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 focus-within:border-[#00E5A8]/30">
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks/neoface"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-transparent text-[13px] text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
              <Link href={`/org/${orgSlug}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="h-8 min-w-[120px] gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </ChartCard>
      </motion.div>
    </div>
  );
}
