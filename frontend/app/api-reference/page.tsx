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
  <div
    className="rounded-2xl border p-6"
    style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}
  >
    <h2
      className="text-[13px] font-bold mb-4 pb-3 border-b"
      style={{ color: accent, borderColor: "#ffffff08" }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    POST: "#10b981",
    GET: "#3b82f6",
    DELETE: "#f43f5e",
    PATCH: "#f59e0b",
  };
  const c = colors[method] || "#6b7280";
  return (
    <span
      className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0"
      style={{ borderColor: `${c}40`, backgroundColor: `${c}15`, color: c }}
    >
      {method}
    </span>
  );
};

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
            API Reference
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            REST API{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #00C2FF, #00E5A8)" }}
            >
              Specification
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Full OpenAPI v3.1 specification for the NeoFace identity platform. Authenticate, enroll, verify,
            revoke, and audit biometric sessions programmatically with typed JSON payloads.
          </p>
        </div>

        {/* Auth */}
        <SectionCard title="Authentication" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            All API calls must include a Bearer token in the Authorization header. Tokens are issued
            from your dashboard and scoped per project. Tokens do not expire but can be revoked at any time.
          </p>
          <pre className="p-3.5 rounded-xl text-[11px] font-mono text-blue-300 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`Authorization: Bearer nfl_live_sk_AbCdEfGhIjKlMnOpQrStUvWx`}
          </pre>
        </SectionCard>

        {/* Endpoints */}
        <SectionCard title="Core Endpoints" accent="#00E5A8">
          <div className="space-y-2.5">
            {[
              { method: "POST", path: "/v1/identities/enroll", desc: "Enroll a new biometric identity. Accepts a face capture payload and returns a persistent identity_id." },
              { method: "POST", path: "/v1/identities/verify", desc: "Verify a live biometric sample against a stored identity. Returns a trust_score and verified boolean." },
              { method: "GET", path: "/v1/sessions/:session_id", desc: "Retrieve the full audit log, modality breakdown, and outcome for a given verification session." },
              { method: "DELETE", path: "/v1/identities/:identity_id", desc: "Permanently delete a biometric identity record from the enclave. Irreversible — compliant with GDPR right to erasure." },
              { method: "POST", path: "/v1/webhooks/register", desc: "Register a callback URL to receive real-time event payloads for identity and session lifecycle events." },
              { method: "GET", path: "/v1/health", desc: "Platform health check. Returns enclave availability, API latency p50/p99, and active incident flags." },
              { method: "PATCH", path: "/v1/identities/:identity_id/update", desc: "Re-enroll biometric template for a given identity. Old template is immediately invalidated." },
            ].map((ep) => (
              <div
                key={ep.path}
                className="p-3.5 rounded-xl border"
                style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <MethodBadge method={ep.method} />
                  <code className="font-mono text-[12px] text-white/85">{ep.path}</code>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{ep.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Request Body Example */}
        <SectionCard title="Sample: Enroll Request Body" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3">
            The enroll endpoint accepts a JSON body with a base64-encoded image capture and optional metadata tags for audit grouping.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`POST /v1/identities/enroll
Content-Type: application/json

{
  "user_ref": "usr_cust_8842",
  "capture": {
    "face_b64": "iVBORw0KGgoAAAANS...",
    "format": "jpeg",
    "modalities": ["face", "liveness"]
  },
  "metadata": {
    "tenant_id": "org_fintech_demo",
    "region": "us-east-1"
  }
}`}
          </pre>
        </SectionCard>

        {/* Response Headers */}
        <SectionCard title="Response Headers" accent="#f59e0b">
          <div className="space-y-2">
            {[
              { header: "X-Request-Id", desc: "Unique trace ID for every API call. Include in support tickets for fast resolution." },
              { header: "X-Enclave-Node", desc: "Identifier of the secure enclave instance that processed the request." },
              { header: "X-Ratelimit-Remaining", desc: "Remaining requests in the current sliding window for your tier." },
              { header: "X-Ratelimit-Reset", desc: "Unix timestamp indicating when the rate limit window resets." },
            ].map((h) => (
              <div key={h.header} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff06", background: "#0a0a0c" }}>
                <code className="font-mono text-[10.5px] text-amber-400 shrink-0 mt-0.5">{h.header}</code>
                <p className="text-[11px] text-white/40">{h.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Versioning */}
        <SectionCard title="API Versioning Policy" accent="#10b981">
          <p className="text-[12px] text-white/45 leading-relaxed">
            The NeoFace API is versioned at the URL path level (e.g., <code className="font-mono text-emerald-400 text-[11px]">/v1/</code>). 
            Major version bumps include breaking changes announced 60 days in advance. Minor updates are backward-compatible.
            Deprecated endpoints serve a <code className="font-mono text-emerald-400 text-[11px]">Sunset</code> header indicating the removal date.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
