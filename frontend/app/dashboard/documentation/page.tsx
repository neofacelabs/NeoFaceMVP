"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Code2, Shield, Fingerprint, Eye,
  ChevronRight, ExternalLink, Terminal, Copy, CheckCircle2,
  Zap, AlertTriangle, Key, Webhook,
} from "lucide-react";

const SECTIONS = [
  {
    id: "authentication", label: "Authentication", icon: Key,
    sub: ["JWT Login", "Refresh Tokens", "API Key Auth", "Rate Limits"],
  },
  {
    id: "face-apis", label: "Face APIs", icon: Eye,
    sub: ["POST /v1/enrollment/enroll", "POST /v1/verification/verify", "GET /v1/users", "DELETE /v1/enrollment/{id}"],
  },
  {
    id: "fingerprint-apis", label: "Fingerprint APIs", icon: Fingerprint,
    sub: ["POST /v1/webauthn/register/begin", "POST /v1/webauthn/register/complete", "POST /v1/webauthn/authenticate/begin", "POST /v1/webauthn/authenticate/complete"],
  },
  {
    id: "liveness", label: "Liveness", icon: Shield,
    sub: ["POST /v1/liveness/passive", "GET /v1/liveness/history"],
  },
  {
    id: "trust-engine", label: "Trust Engine", icon: Zap,
    sub: ["GET /v1/trust-engine/score", "POST /v1/device-trust/register", "GET /v1/risk/events"],
  },
  {
    id: "sdks", label: "SDKs", icon: Terminal,
    sub: ["Python SDK", "Node.js SDK", "React Hooks", "Flutter Plugin"],
  },
  {
    id: "errors", label: "Error Codes", icon: AlertTriangle,
    sub: ["4xx Errors", "5xx Errors", "Biometric Errors"],
  },
  {
    id: "webhooks", label: "Webhooks", icon: Webhook,
    sub: ["Event Types", "Signature Verification", "Retry Logic"],
  },
];

const CONTENT: Record<string, React.ReactNode> = {
  "authentication": (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold text-white mb-2">Authentication</h2>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          NeoFace supports two authentication mechanisms: JWT Bearer tokens for dashboard users and API keys for
          machine-to-machine (M2M) requests.
        </p>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "rgba(0,194,255,0.04)", border: "1px solid rgba(0,194,255,0.12)" }}>
        <p className="text-[12px] font-semibold text-white mb-2">API Key Authentication (recommended)</p>
        <pre className="text-[11.5px] font-mono overflow-auto" style={{ color: "#00C2FF" }}>
{`curl https://api.neoface.io/v1/users \\
  -H "x-api-key: sk_live_your_secret_key"`}
        </pre>
      </div>

      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[12px] font-semibold text-white mb-2">JWT Bearer Token</p>
        <pre className="text-[11.5px] font-mono overflow-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
{`# 1. Obtain a token
POST /api/v1/auth/login
{"email": "you@company.com", "password": "..."}

# 2. Use the token
curl https://api.neoface.io/v1/users \\
  -H "Authorization: Bearer <access_token>"`}
        </pre>
      </div>

      <div className="space-y-3">
        <p className="text-[13px] font-semibold text-white">Rate Limits</p>
        <table className="dash-table">
          <thead><tr><th>Plan</th><th>Requests/month</th><th>Burst (req/s)</th></tr></thead>
          <tbody>
            <tr><td>Starter</td><td>1,000</td><td>10</td></tr>
            <tr><td>Pro</td><td>100,000</td><td>60</td></tr>
            <tr><td>Enterprise</td><td>Unlimited</td><td>Custom</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  ),

  "face-apis": (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold text-white mb-2">Face Recognition APIs</h2>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          Enroll and verify identities using ArcFace 512-d embeddings. Images are processed server-side and only the
          mathematical embedding is stored — never the raw pixel data.
        </p>
      </div>

      {[
        {
          method: "POST", path: "/v1/enrollment/enroll",
          desc: "Enroll a new face identity. Accepts a multipart/form-data request with the face image.",
          params: [
            { name: "image", type: "file", required: true, desc: "JPEG/PNG/WebP face image. Face must be at least 160×160px." },
            { name: "user_id", type: "string", required: true, desc: "Your unique identifier for this user." },
          ],
          response: `{
  "success": true,
  "user_id": "usr_abc123",
  "embedding_id": "emb_9f3a2b1c",
  "quality_score": 0.94,
  "face_count": 1,
  "created_at": "2026-06-25T07:00:00Z"
}`,
          color: "#00C2FF",
        },
        {
          method: "POST", path: "/v1/verification/verify",
          desc: "Verify a face against an enrolled identity.",
          params: [
            { name: "image", type: "file", required: true, desc: "Face image to verify." },
            { name: "user_id", type: "string", required: true, desc: "The enrolled user to verify against." },
          ],
          response: `{
  "match": true,
  "confidence": 0.983,
  "user_id": "usr_abc123",
  "latency_ms": 61
}`,
          color: "#00E5A8",
        },
      ].map(endpoint => (
        <div key={endpoint.path} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: `${endpoint.color}15`, color: endpoint.color }}>
              {endpoint.method}
            </span>
            <code className="text-[13px] font-mono text-white">{endpoint.path}</code>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>{endpoint.desc}</p>
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Parameters</p>
              <div className="space-y-2">
                {endpoint.params.map(p => (
                  <div key={p.name} className="flex items-start gap-3 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <code className="text-[11.5px] font-mono shrink-0" style={{ color: endpoint.color }}>{p.name}</code>
                    <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{p.type}</span>
                    {p.required && <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>required</span>}
                    <p className="text-[11.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Response</p>
              <pre className="text-[11.5px] rounded-xl p-4 overflow-auto" style={{ background: "rgba(255,255,255,0.03)", color: endpoint.color, fontFamily: "monospace" }}>
                {endpoint.response}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("authentication");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredSections = SECTIONS.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sub.some(ss => ss.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const content = CONTENT[activeSection] ?? (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <BookOpen size={28} style={{ color: "rgba(255,255,255,0.1)" }} />
      <p className="text-[14px] font-semibold text-white">Coming Soon</p>
      <p className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.35)" }}>
        This section is being written. Check back soon.
      </p>
    </div>
  );

  return (
    <div className="max-w-[1400px] h-[calc(100vh-120px)] flex gap-0 rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Sidebar */}
      <div className="w-64 shrink-0 flex flex-col" style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search docs…"
              className="bg-transparent outline-none text-[12px] text-white flex-1"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {filteredSections.map(section => (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left transition-all"
                style={{
                  background: activeSection === section.id ? "rgba(255,255,255,0.06)" : "transparent",
                  color: activeSection === section.id ? "#fff" : "rgba(255,255,255,0.45)",
                  border: activeSection === section.id ? "1px solid rgba(255,255,255,0.09)" : "1px solid transparent",
                }}
              >
                <section.icon size={12} />
                <span className="text-[12.5px] font-medium">{section.label}</span>
              </button>
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <a href="/api/docs" target="_blank"
            className="flex items-center gap-2 text-[11.5px] font-medium transition-colors"
            style={{ color: "rgba(0,194,255,0.6)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00C2FF")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,194,255,0.6)")}>
            <Terminal size={11} /> OpenAPI / Swagger
            <ExternalLink size={9} className="ml-auto" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {content}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
