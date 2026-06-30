"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#a78bfa",
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
            style={{ borderColor: "#a78bfa20", backgroundColor: "#a78bfa05", color: "#a78bfa" }}
          >
            System Limits
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Rate Limits{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)" }}>
              & Quotas
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            NeoFace enforces per-tier rate limits to ensure platform stability and fair usage.
            This page details request ceilings, burst limits, MAU quotas, and best practices
            for implementing backoff strategies in your integration.
          </p>
        </div>

        {/* Tier Quotas */}
        <SectionCard title="Request Quotas by Plan" accent="#a78bfa">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="border-b text-white/40" style={{ borderColor: "#ffffff08" }}>
                  <th className="py-2.5 pr-4">Plan</th>
                  <th className="py-2.5 pr-4">Req/s (Sustained)</th>
                  <th className="py-2.5 pr-4">Req/s (Burst)</th>
                  <th className="py-2.5 pr-4">MAU Limit</th>
                  <th className="py-2.5">Monthly Verifications</th>
                </tr>
              </thead>
              <tbody className="text-white/70 divide-y" style={{ borderColor: "#ffffff06" }}>
                {[
                  { plan: "Free", color: "#10b981", rps: "5", burst: "10", mau: "500", ver: "5,000" },
                  { plan: "Starter", color: "#3b82f6", rps: "25", burst: "50", mau: "5,000", ver: "50,000" },
                  { plan: "Pro", color: "#a78bfa", rps: "100", burst: "250", mau: "50,000", ver: "500,000" },
                  { plan: "Business", color: "#f59e0b", rps: "500", burst: "1,000", mau: "500,000", ver: "5,000,000" },
                  { plan: "Enterprise", color: "#00E5A8", rps: "Custom", burst: "Custom", mau: "Unlimited", ver: "Unlimited" },
                ].map((r) => (
                  <tr key={r.plan} className="border-b" style={{ borderColor: "#ffffff06" }}>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: r.color }}>{r.plan}</td>
                    <td className="py-2.5 pr-4 font-mono">{r.rps}</td>
                    <td className="py-2.5 pr-4 font-mono">{r.burst}</td>
                    <td className="py-2.5 pr-4 font-mono">{r.mau}</td>
                    <td className="py-2.5 font-mono">{r.ver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10.5px] text-white/25 mt-3">MAU = Monthly Active Users. Overage billed at $0.004 per additional verification.</p>
        </SectionCard>

        {/* Rate Limit Headers */}
        <SectionCard title="Rate Limit Response Headers" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Every API response includes headers so your client can proactively throttle requests
            before hitting a 429 error. Monitor these headers in your HTTP client or middleware layer.
          </p>
          <div className="space-y-2">
            {[
              { header: "X-Ratelimit-Limit", desc: "Your tier's maximum sustained requests per second." },
              { header: "X-Ratelimit-Remaining", desc: "Requests remaining in the current 1-second window." },
              { header: "X-Ratelimit-Reset", desc: "Unix timestamp (ms) when the current window expires." },
              { header: "Retry-After", desc: "Seconds to wait before retrying. Only sent with 429 responses." },
            ].map((h) => (
              <div key={h.header} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <code className="font-mono text-[10.5px] text-blue-400 shrink-0 mt-0.5">{h.header}</code>
                <p className="text-[11px] text-white/40">{h.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 429 Handling */}
        <SectionCard title="Handling 429 Too Many Requests" accent="#f59e0b">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            When you exceed your rate limit, the API returns a <code className="font-mono text-[11px] text-amber-400">429 Too Many Requests</code> status.
            Implement exponential backoff with jitter to avoid thundering-herd retry storms.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`async function verifyWithBackoff(params, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await nfl.identities.verify(params);
    } catch (err) {
      if (err.status !== 429 || attempt === maxRetries - 1) throw err;
      
      const retryAfter = parseInt(err.headers['retry-after'] || '1');
      const jitter = Math.random() * 500;  // add up to 500ms jitter
      const delay = (retryAfter * 1000) * Math.pow(2, attempt) + jitter;
      
      console.log(\`Rate limited. Retrying in \${delay}ms (attempt \${attempt + 1})\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`}
          </pre>
        </SectionCard>

        {/* Endpoint-specific */}
        <SectionCard title="Per-Endpoint Limits" accent="#f43f5e">
          <div className="space-y-2">
            {[
              { endpoint: "POST /v1/identities/enroll", note: "Max 10 concurrent enrollment sessions per API key to prevent enclave overload." },
              { endpoint: "POST /v1/identities/verify", note: "Standard tier limits apply. Burst window resets every 1 second." },
              { endpoint: "GET /v1/sessions/:id", note: "5× higher read quota than write endpoints — reads are cheaper operations." },
              { endpoint: "DELETE /v1/identities/:id", note: "Max 100 deletes/minute. Bulk deletion requires an Enterprise plan." },
            ].map((e) => (
              <div key={e.endpoint} className="p-3.5 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <code className="font-mono text-[11px] text-white/80 block mb-1">{e.endpoint}</code>
                <p className="text-[11px] text-white/40">{e.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Quota Monitoring */}
        <SectionCard title="Monitoring Your Usage" accent="#10b981">
          <p className="text-[12px] text-white/45 leading-relaxed">
            The NeoFace Dashboard provides real-time usage graphs at <strong className="text-white">Dashboard → Usage & Billing</strong>. 
            You can set alert thresholds (e.g., notify when 80% of monthly verifications are consumed) 
            via email or webhook. All usage data is also accessible programmatically via the 
            <code className="font-mono text-[11px] text-emerald-400 mx-1">GET /v1/usage/summary</code> endpoint.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
