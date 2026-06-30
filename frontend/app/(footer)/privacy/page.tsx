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
            Legal
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Privacy{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)" }}>
              Policy
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Effective Date: January 1, 2026. Last Updated: July 1, 2026.
            This Privacy Policy describes how NeoFace Labs, Inc. collects, uses, and protects information 
            in connection with our identity verification platform.
          </p>
        </div>

        {/* Data We Collect */}
        <SectionCard title="Information We Collect" accent="#a78bfa">
          <div className="space-y-4">
            <div>
              <h3 className="text-[12px] font-semibold text-white mb-2">Biometric Data (via your application)</h3>
              <p className="text-[11.5px] text-white/45 leading-relaxed">
                When end-users of our customers use NeoFace-powered apps, camera frames are processed 
                on-device to extract mathematical geometric descriptors. These descriptors — not raw images — 
                are transmitted to our secure enclaves. Raw imagery is immediately discarded and never stored.
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-white mb-2">Account & Technical Data</h3>
              <p className="text-[11.5px] text-white/45 leading-relaxed">
                For dashboard users (developers and admins), we collect: name, email address, company name,
                billing address, payment method tokens (via Stripe — we never store full card numbers),
                API usage logs, and browser session data for dashboard functionality.
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-white mb-2">Platform Telemetry</h3>
              <p className="text-[11.5px] text-white/45 leading-relaxed">
                We collect anonymized API latency, error rates, and system health telemetry for infrastructure
                monitoring. This data contains no PII and is aggregated at the request level.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* How We Use It */}
        <SectionCard title="How We Use Your Information" accent="#00E5A8">
          <ul className="space-y-2.5 text-[12px] text-white/50">
            {[
              "To provide, operate, and improve the NeoFace identity platform",
              "To authenticate and authorize API requests from your applications",
              "To process billing and manage your subscription",
              "To send transactional notifications (verification alerts, billing receipts, security notices)",
              "To comply with legal obligations, including court orders and regulatory audits",
              "To investigate fraud, abuse, or violations of our Terms of Service",
            ].map((u, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard title="Data Retention" accent="#00C2FF">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="border-b text-white/40" style={{ borderColor: "#ffffff08" }}>
                  <th className="py-2.5 pr-4">Data Type</th>
                  <th className="py-2.5 pr-4">Retention Period</th>
                  <th className="py-2.5">Deletion Method</th>
                </tr>
              </thead>
              <tbody className="text-white/60 divide-y" style={{ borderColor: "#ffffff06" }}>
                {[
                  ["Biometric Descriptor Hash", "Until identity deletion request", "Enclave memory wipe + DB purge"],
                  ["Verification Session Logs", "90 days (configurable)", "Automated scheduled deletion"],
                  ["API Access Logs", "30 days", "Log rotation & purge"],
                  ["Billing Records", "7 years (tax compliance)", "Secure archival"],
                  ["Account Data", "Until account deletion", "Full purge within 30 days"],
                ].map(([type, ret, del]) => (
                  <tr key={type} className="border-b" style={{ borderColor: "#ffffff06" }}>
                    <td className="py-2.5 pr-4 font-semibold text-white">{type}</td>
                    <td className="py-2.5 pr-4">{ret}</td>
                    <td className="py-2.5">{del}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Your Rights */}
        <SectionCard title="Your Rights (GDPR & CCPA)" accent="#10b981">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { right: "Right of Access", desc: "Request a copy of all personal data we hold about you." },
              { right: "Right to Erasure", desc: "Request permanent deletion of your data, including biometric descriptors." },
              { right: "Right to Portability", desc: "Export your account and usage data in machine-readable JSON format." },
              { right: "Right to Object", desc: "Opt out of any processing based on legitimate interests." },
              { right: "Right to Rectification", desc: "Correct inaccurate personal information we hold." },
              { right: "Right to Restriction", desc: "Limit processing while a dispute is under review." },
            ].map((r) => (
              <div key={r.right} className="p-3.5 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[11.5px] font-semibold text-emerald-400 mb-1">{r.right}</h3>
                <p className="text-[11px] text-white/40">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/30 mt-3">To exercise any right, contact us at privacy@neoface.io. We respond within 30 days.</p>
        </SectionCard>

        {/* Third Parties */}
        <SectionCard title="Third-Party Data Processors" accent="#f59e0b">
          <div className="space-y-2">
            {[
              { name: "Stripe", purpose: "Payment processing. PCI DSS Level 1 certified.", link: "stripe.com/privacy" },
              { name: "AWS", purpose: "Cloud infrastructure and secure enclave hosting (Nitro Enclaves).", link: "aws.amazon.com/privacy" },
              { name: "Datadog", purpose: "Infrastructure monitoring telemetry (no PII included).", link: "datadoghq.com/privacy" },
            ].map((t) => (
              <div key={t.name} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <span className="text-[12px] font-bold text-amber-400 shrink-0 w-20">{t.name}</span>
                <div>
                  <p className="text-[11px] text-white/50">{t.purpose}</p>
                  <p className="text-[10px] text-white/25 font-mono mt-0.5">{t.link}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Data Protection Officer" accent="#f43f5e">
          <p className="text-[12px] text-white/45 leading-relaxed">
            NeoFace Labs, Inc. has appointed a Data Protection Officer (DPO) responsible for overseeing
            our data protection strategy and compliance obligations. For privacy-related inquiries, 
            contact our DPO at <span className="font-mono text-[11px] text-red-400">dpo@neoface.io</span> or write to:
          </p>
          <div className="mt-3 p-4 rounded-xl border text-[11.5px] text-white/50" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
            NeoFace Labs, Inc. — Data Protection Officer<br />
            548 Market St PMB 12345<br />
            San Francisco, CA 94104, USA
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
