"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#00C2FF",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => (
  <div className="rounded-2xl border p-6" style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}>
    <h2 className="text-[13px] font-bold mb-4 pb-3 border-b" style={{ color: accent, borderColor: "#ffffff08" }}>
      {title}
    </h2>
    {children}
  </div>
);

export default function Page() {
  return (
    <SubpageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <div className="mb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-4 border"
            style={{ borderColor: "#00C2FF20", backgroundColor: "#00C2FF05", color: "#00C2FF" }}
          >
            API Docs
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            API{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00C2FF, #00E5A8)" }}>
              Documentation
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Complete developer reference for the NeoFace identity platform. Covers authentication, 
            enrollment, verification, session management, webhooks, and error handling.
          </p>
        </div>

        {/* Auth */}
        <SectionCard title="Authentication" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Authenticate all API requests with a Bearer token in the <code className="font-mono text-blue-400 text-[11px]">Authorization</code> header.
            Generate tokens from the Dashboard under <strong className="text-white">Settings → API Keys</strong>.
          </p>
          <pre className="p-3.5 rounded-xl text-[11px] font-mono text-blue-300 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`Authorization: Bearer nfl_live_sk_AbCdEf...`}
          </pre>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {[
              { type: "Live Key", prefix: "nfl_live_sk_", use: "Production API calls. Charges your active plan." },
              { type: "Sandbox Key", prefix: "nfl_sandbox_sk_", use: "Testing. No charges, mock biometrics accepted." },
            ].map((k) => (
              <div key={k.type} className="p-3.5 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="font-semibold text-white text-[11.5px] mb-1">{k.type}</div>
                <code className="font-mono text-[10px] text-emerald-400 block mb-1">{k.prefix}••••••</code>
                <p className="text-[11px] text-white/40">{k.use}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Endpoint Groups */}
        <SectionCard title="Endpoint Groups" accent="#00E5A8">
          <div className="space-y-3">
            {[
              {
                group: "Identities",
                base: "/v1/identities",
                color: "#00E5A8",
                endpoints: [
                  { method: "POST", path: "/enroll", desc: "Enroll a new biometric identity" },
                  { method: "POST", path: "/verify", desc: "Verify a live biometric against stored template" },
                  { method: "GET", path: "/:id", desc: "Retrieve identity metadata" },
                  { method: "PATCH", path: "/:id/update", desc: "Re-enroll biometric template" },
                  { method: "DELETE", path: "/:id", desc: "Permanently delete identity (GDPR erasure)" },
                ],
              },
              {
                group: "Sessions",
                base: "/v1/sessions",
                color: "#3b82f6",
                endpoints: [
                  { method: "GET", path: "/:session_id", desc: "Retrieve session verification result and audit log" },
                  { method: "POST", path: "/:session_id/revoke", desc: "Invalidate an active session token" },
                ],
              },
              {
                group: "Webhooks",
                base: "/v1/webhooks",
                color: "#a78bfa",
                endpoints: [
                  { method: "POST", path: "/register", desc: "Register a new webhook endpoint" },
                  { method: "GET", path: "/", desc: "List all registered webhook endpoints" },
                  { method: "DELETE", path: "/:webhook_id", desc: "Remove a webhook endpoint" },
                  { method: "POST", path: "/:webhook_id/test", desc: "Send a test event to an endpoint" },
                ],
              },
              {
                group: "Usage",
                base: "/v1/usage",
                color: "#f59e0b",
                endpoints: [
                  { method: "GET", path: "/summary", desc: "Monthly verification count and MAU summary" },
                  { method: "GET", path: "/audit/logs", desc: "Paginated audit log export" },
                ],
              },
            ].map((g) => (
              <div key={g.group} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[12px] font-bold" style={{ color: g.color }}>{g.group}</h3>
                  <code className="font-mono text-[10px] text-white/25">{g.base}</code>
                </div>
                <div className="space-y-1.5">
                  {g.endpoints.map((ep) => {
                    const methodColors: Record<string, string> = { POST: "#10b981", GET: "#3b82f6", DELETE: "#f43f5e", PATCH: "#f59e0b" };
                    const mc = methodColors[ep.method];
                    return (
                      <div key={ep.path} className="flex items-center gap-3 text-[11.5px]">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0" style={{ color: mc, borderColor: `${mc}30`, background: `${mc}10` }}>{ep.method}</span>
                        <code className="font-mono text-white/70 shrink-0">{g.base}{ep.path}</code>
                        <span className="text-white/30 hidden sm:block">{ep.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Error Codes */}
        <SectionCard title="Error Code Reference" accent="#f43f5e">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="border-b text-white/40" style={{ borderColor: "#ffffff08" }}>
                  <th className="py-2.5 pr-4">HTTP Code</th>
                  <th className="py-2.5 pr-4">Error Code</th>
                  <th className="py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y text-white/60" style={{ borderColor: "#ffffff06" }}>
                {[
                  ["400", "ERR_INVALID_PAYLOAD", "Request body missing required fields or malformed JSON"],
                  ["401", "ERR_UNAUTHORIZED", "Missing, expired, or revoked API key"],
                  ["403", "ERR_FORBIDDEN", "API key does not have permission for this operation"],
                  ["404", "ERR_NOT_FOUND", "Identity, session, or webhook ID does not exist"],
                  ["422", "ERR_LIVENESS_FAILED", "Liveness detection rejected the capture"],
                  ["422", "ERR_TEMPLATE_MISMATCH", "Biometric match score below configured threshold"],
                  ["422", "ERR_LOW_QUALITY", "Image quality too low for reliable template extraction"],
                  ["429", "ERR_RATE_EXCEEDED", "Request rate limit exceeded for your plan tier"],
                  ["503", "ERR_ENCLAVE_UNAVAILABLE", "Secure enclave cluster temporarily unreachable — retry with backoff"],
                ].map(([code, err, desc]) => (
                  <tr key={err} className="border-b" style={{ borderColor: "#ffffff06" }}>
                    <td className="py-2.5 pr-4 font-mono text-red-400">{code}</td>
                    <td className="py-2.5 pr-4 font-mono text-white/80 text-[10.5px]">{err}</td>
                    <td className="py-2.5 text-white/45">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Pagination */}
        <SectionCard title="Pagination" accent="#10b981">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            List endpoints use cursor-based pagination. Pass the <code className="font-mono text-[11px] text-emerald-400">cursor</code> from the 
            previous response as a query parameter to fetch the next page.
          </p>
          <pre className="p-3.5 rounded-xl text-[11px] font-mono text-white/65 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`GET /v1/usage/audit/logs?limit=50&cursor=01JYNXKGM4ZQC

// Response
{
  "data": [...],
  "meta": {
    "count": 50,
    "next_cursor": "01JYNXLPM5ABD",
    "has_more": true
  }
}`}
          </pre>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
