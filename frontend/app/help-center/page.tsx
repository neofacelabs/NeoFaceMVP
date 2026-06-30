"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#3b82f6",
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

const FAQItem = ({ q, a }: { q: string; a: string }) => (
  <div className="border-b pb-4" style={{ borderColor: "#ffffff07" }}>
    <h3 className="text-[12px] font-semibold text-white mb-2">{q}</h3>
    <p className="text-[11.5px] text-white/45 leading-relaxed">{a}</p>
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
            style={{ borderColor: "#3b82f620", backgroundColor: "#3b82f605", color: "#3b82f6" }}
          >
            Support Hub
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Help{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #00C2FF)" }}>
              Center
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Troubleshooting guides, integration support, billing help, and platform status.
            Find answers to common issues or reach our engineering support team directly.
          </p>
        </div>

        {/* Categories */}
        <SectionCard title="Browse by Category" accent="#3b82f6">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: "🔐", title: "Authentication Issues", desc: "API key errors, token expiry, CORS configuration, and session management problems." },
              { icon: "📷", title: "Camera & Device Setup", desc: "Granting camera permissions, browser support matrix, and OS-level sensor configuration." },
              { icon: "💳", title: "Billing & Quotas", desc: "Upgrade paths, invoice downloads, overage alerts, and payment method updates." },
              { icon: "🔗", title: "Webhook Delivery", desc: "Debugging failed deliveries, signature verification, and endpoint configuration." },
              { icon: "⚙️", title: "SDK Integration", desc: "Installation, versioning, breaking changes, and framework-specific setup guides." },
              { icon: "📊", title: "Usage & Analytics", desc: "Understanding your verification volume dashboard, MAU counts, and export formats." },
            ].map((c) => (
              <div key={c.title} className="p-4 rounded-xl border hover:border-white/10 transition-all cursor-pointer" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-xl mb-2">{c.icon}</div>
                <h3 className="text-[11.5px] font-semibold text-white mb-1">{c.title}</h3>
                <p className="text-[10.5px] text-white/35 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Common Issues */}
        <SectionCard title="Common Issues & Resolutions" accent="#00E5A8">
          <div className="space-y-4">
            {[
              {
                issue: "API returns 401 Unauthorized",
                steps: [
                  "Verify the Authorization header format: Bearer nfl_live_sk_...",
                  "Ensure you are using a live key (not sandbox) for production endpoints",
                  "Check if the key has been revoked in Dashboard → API Keys",
                  "Confirm the key scope matches the endpoint you are calling",
                ],
              },
              {
                issue: "Liveness check always fails",
                steps: [
                  "Ensure the camera captures the user in adequate lighting (avoid backlighting)",
                  "Test in the NeoFace sandbox with mock captures before going live",
                  "Check if anti-spoofing sensitivity is set too high for your use case (adjustable in Dashboard)",
                  "Confirm the user's face is fully in frame and not partially occluded",
                ],
              },
              {
                issue: "Webhook events not arriving",
                steps: [
                  "Verify your endpoint returns HTTP 200 within 10 seconds",
                  "Check Dashboard → Webhooks → Event Log for failed delivery attempts",
                  "Ensure your server is not behind a firewall blocking NeoFace IPs",
                  "Validate signature verification logic — incorrect parsing causes 401 rejections",
                ],
              },
            ].map((item) => (
              <div key={item.issue} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold text-white mb-2.5">{item.issue}</h3>
                <ol className="space-y-1.5">
                  {item.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11.5px] text-white/45">
                      <span className="font-mono text-emerald-400 shrink-0">{i + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Platform Status */}
        <SectionCard title="Platform Status" accent="#10b981">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-[12px] font-semibold text-white">All Systems Operational</span>
            <span className="text-[10.5px] text-white/30">· Last checked 2 minutes ago</span>
          </div>
          <div className="space-y-2">
            {[
              { service: "API Endpoints", status: "Operational", uptime: "99.97%" },
              { service: "Secure Enclave Cluster (us-east-1)", status: "Operational", uptime: "99.99%" },
              { service: "Webhook Delivery", status: "Operational", uptime: "99.95%" },
              { service: "Dashboard & Portal", status: "Operational", uptime: "99.98%" },
            ].map((s) => (
              <div key={s.service} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <span className="text-[12px] text-white/70">{s.service}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10.5px] font-mono text-white/30">{s.uptime}</span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10.5px] text-white/25 mt-3">Full incident history and real-time status: status.neoface.io</p>
        </SectionCard>

        {/* Contact Support */}
        <SectionCard title="Contact Support" accent="#a78bfa">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { tier: "Free & Starter", channel: "Community Forum", resp: "Best effort", color: "#6b7280", desc: "Post on our GitHub Discussions forum. Community and occasional team responses." },
              { tier: "Pro Plan", channel: "Email Support", resp: "< 24 hours", color: "#3b82f6", desc: "Email support@neoface.io. Business days only. Engineering escalation available." },
              { tier: "Business Plan", channel: "Priority Email + Slack", resp: "< 4 hours", color: "#a78bfa", desc: "Shared Slack channel with your NeoFace account engineer. Business hours SLA." },
              { tier: "Enterprise", channel: "Dedicated SRE", resp: "< 1 hour", color: "#00E5A8", desc: "24/7 dedicated support engineer, incident hotline, and custom escalation paths." },
            ].map((c) => (
              <div key={c.tier} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono border" style={{ color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}>{c.tier}</span>
                  <span className="font-mono text-[9px] text-white/25">{c.resp} SLA</span>
                </div>
                <h3 className="text-[12px] font-semibold text-white mb-1">{c.channel}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
