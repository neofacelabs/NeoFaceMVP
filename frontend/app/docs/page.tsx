"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const badge = (label: string, color: string) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border"
    style={{ borderColor: `${color}40`, backgroundColor: `${color}10`, color }}
  >
    {label}
  </span>
);

const SectionCard = ({
  title,
  children,
  accent = "#00E5A8",
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

export default function Page() {
  return (
    <SubpageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <div className="mb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-4 border"
            style={{ borderColor: "#00E5A820", backgroundColor: "#00E5A805", color: "#00E5A8" }}
          >
            Developer Docs
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            NeoFace{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)" }}
            >
              Documentation
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            The complete reference for integrating NeoFace biometric authentication into your apps.
            From SDK installation to enclave architecture — everything you need to build with confidence.
          </p>
        </div>

        {/* Quick Navigation */}
        <SectionCard title="Documentation Chapters" accent="#00E5A8">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { num: "01", title: "Getting Started", desc: "SDK installation, API key creation, and running your first identity verification in under 5 minutes." },
              { num: "02", title: "Authentication Flows", desc: "Understand enrollment vs. verification flows, session lifecycle, and token refresh cycles." },
              { num: "03", title: "Biometric Fusion", desc: "How NeoFace fuses face geometry, iris scans, and fingerprint into a single composite trust decision." },
              { num: "04", title: "Webhooks & Events", desc: "Subscribe to real-time lifecycle events: identity.enrolled, identity.verified, session.revoked." },
              { num: "05", title: "Secure Enclaves", desc: "Deep dive into homomorphic template encryption inside AWS Nitro Enclaves and Intel SGX." },
              { num: "06", title: "SDK Reference", desc: "Full TypeScript, Python, and React Native SDK method signatures, type definitions, and examples." },
            ].map((ch) => (
              <div
                key={ch.num}
                className="p-4 rounded-xl border transition-all hover:border-white/10 cursor-pointer"
                style={{ borderColor: "#ffffff06", background: "#0a0a0c" }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-mono text-white/25 mt-0.5 shrink-0">{ch.num}</span>
                  <div>
                    <h3 className="text-[12px] font-semibold text-white mb-1">{ch.title}</h3>
                    <p className="text-[11px] text-white/40 leading-relaxed">{ch.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* SDK Support */}
        <SectionCard title="Supported SDKs & Platforms" accent="#00C2FF">
          <div className="flex flex-wrap gap-2 mb-4">
            {["TypeScript", "Python", "Go", "React Native", "Flutter", "Swift", "Kotlin"].map((sdk) => (
              <span
                key={sdk}
                className="px-3 py-1 rounded-lg text-[11px] font-mono text-white/70 border"
                style={{ borderColor: "#ffffff08", background: "#111113" }}
              >
                {sdk}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-white/45 leading-relaxed">
            All SDKs are published to their respective package registries (npm, PyPI, pub.dev) and maintained
            under semantic versioning. Breaking changes are announced via changelog 30 days in advance.
          </p>
        </SectionCard>

        {/* API Environments */}
        <SectionCard title="API Environments" accent="#a78bfa">
          <div className="space-y-3">
            {[
              { env: "Sandbox", url: "https://sandbox.api.neoface.io/v1", color: "#10b981", desc: "Safe test environment with mock biometric data. No real hardware required." },
              { env: "Staging", url: "https://staging.api.neoface.io/v1", color: "#f59e0b", desc: "Pre-production environment. Runs real enclave logic against test credentials." },
              { env: "Production", url: "https://api.neoface.io/v1", color: "#00E5A8", desc: "Live environment with SLA guarantees, enclave isolation, and full audit trail." },
            ].map((e) => (
              <div key={e.env} className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {badge(e.env, e.color)}
                  </div>
                  <p className="text-[11px] text-white/40">{e.desc}</p>
                </div>
                <span className="font-mono text-[10px] text-white/30 shrink-0">{e.url}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Response Format */}
        <SectionCard title="Standard Response Format" accent="#10b981">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            All NeoFace API responses follow a consistent JSON envelope with a top-level <code className="font-mono text-emerald-400 text-[11px]">status</code>, a <code className="font-mono text-emerald-400 text-[11px]">data</code> payload, and a timestamped <code className="font-mono text-emerald-400 text-[11px]">request_id</code> for tracing.
          </p>
          <pre className="p-4 rounded-xl text-[11.5px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`{
  "status": "success",
  "request_id": "req_01JYNXKGM4ZQC",
  "data": {
    "verified": true,
    "trust_score": 0.974,
    "modalities": ["face", "liveness"],
    "session_id": "sess_0xA1F2C3"
  },
  "timestamp": "2026-07-01T00:47:58Z"
}`}
          </pre>
        </SectionCard>

        {/* Error Codes */}
        <SectionCard title="Common Error Codes" accent="#f43f5e">
          <div className="space-y-2">
            {[
              { code: "ERR_LIVENESS_FAILED", http: "422", desc: "Liveness check could not confirm live human presence. Check camera quality and lighting." },
              { code: "ERR_TEMPLATE_MISMATCH", http: "401", desc: "Biometric template comparison score fell below the configured threshold." },
              { code: "ERR_ENCLAVE_UNAVAILABLE", http: "503", desc: "Secure enclave was unreachable. Automatic retry with exponential backoff is recommended." },
              { code: "ERR_RATE_EXCEEDED", http: "429", desc: "Request volume exceeded your plan's sustained or burst rate ceiling." },
            ].map((e) => (
              <div key={e.code} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff06", background: "#0a0a0c" }}>
                <span className="font-mono text-[10px] text-red-400 shrink-0 mt-0.5">{e.http}</span>
                <div>
                  <span className="font-mono text-[11px] text-white/80 block mb-0.5">{e.code}</span>
                  <p className="text-[11px] text-white/40">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
