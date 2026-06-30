"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#00E5A8",
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
            style={{ borderColor: "#00E5A820", backgroundColor: "#00E5A805", color: "#00E5A8" }}
          >
            Legal
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Terms of{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)" }}>
              Service
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Effective Date: January 1, 2026. These Terms of Service govern your access to and use of 
            NeoFace Labs APIs, SDKs, dashboards, and related services. By accessing our platform, 
            you agree to be bound by these terms.
          </p>
        </div>

        {/* Definitions */}
        <SectionCard title="Definitions" accent="#00E5A8">
          <div className="space-y-2">
            {[
              { term: "\"Platform\"", def: "The NeoFace Labs identity verification APIs, SDKs, dashboard, and documentation." },
              { term: "\"Customer\"", def: "Any organization or individual that registers for and uses the NeoFace Platform." },
              { term: "\"End User\"", def: "A person whose biometric data is processed through a Customer's application using NeoFace." },
              { term: "\"Biometric Data\"", def: "Mathematical geometric descriptors derived from face, iris, or fingerprint captures." },
            ].map((d) => (
              <div key={d.term} className="flex items-start gap-3 text-[12px]">
                <span className="font-mono text-emerald-400 shrink-0 mt-0.5">{d.term}</span>
                <span className="text-white/45">{d.def}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Acceptable Use */}
        <SectionCard title="Acceptable Use Policy" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Customers may use the NeoFace Platform for lawful identity verification purposes only. The following uses are expressly prohibited:
          </p>
          <div className="space-y-2">
            {[
              "Using NeoFace to conduct surveillance, tracking, or profiling of individuals without their explicit consent",
              "Attempting to reverse-engineer, decompile, or extract biometric templates from the API",
              "Reselling API access without an authorized reseller agreement",
              "Using the Platform in jurisdictions where biometric data processing is prohibited without specific consent frameworks",
              "Processing biometric data of minors under 16 without verifiable parental consent",
            ].map((u, i) => (
              <div key={i} className="p-3 rounded-xl border flex items-start gap-2.5" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <span className="text-red-400 mt-0.5 shrink-0 text-[13px]">✕</span>
                <p className="text-[11.5px] text-white/50">{u}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Customer Obligations */}
        <SectionCard title="Customer Consent Obligations" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Customers integrating NeoFace must fulfill the following obligations toward their End Users before initiating any biometric capture:
          </p>
          <ul className="space-y-2.5 text-[12px] text-white/50">
            {[
              "Provide clear, plain-language disclosure that biometric data will be collected and processed",
              "Obtain affirmative opt-in consent — pre-checked boxes or implied consent are insufficient",
              "Explain the purpose of the biometric collection and the retention period",
              "Provide a mechanism for End Users to withdraw consent and request deletion at any time",
              "Maintain records of consent for audit purposes",
            ].map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 shrink-0">§</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* SLA */}
        <SectionCard title="Service Level Agreement (SLA)" accent="#f59e0b">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { metric: "API Uptime", val: "99.95%", note: "Measured monthly, excluding scheduled maintenance" },
              { metric: "Enclave Latency", val: "< 200ms", note: "p99 for verification calls at standard load" },
              { metric: "Incident Response", val: "< 1 hour", note: "For P1 (service-wide outage) incidents" },
            ].map((s) => (
              <div key={s.metric} className="p-4 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-[16px] font-bold text-amber-400 mb-1">{s.val}</div>
                <div className="text-[11.5px] font-semibold text-white mb-1">{s.metric}</div>
                <p className="text-[10px] text-white/30">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-white/40 leading-relaxed">
            SLA credits are issued for downtime exceeding the monthly uptime guarantee, calculated as a percentage 
            of your monthly subscription fee. Enterprise customers receive escalated SLA tiers and dedicated incident channels.
          </p>
        </SectionCard>

        {/* Termination */}
        <SectionCard title="Suspension & Termination" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace Labs may suspend or terminate your access immediately, with or without notice, for:
          </p>
          <ul className="space-y-1.5 text-[12px] text-white/50">
            {[
              "Violation of the Acceptable Use Policy",
              "Non-payment of subscription fees past a 15-day grace period",
              "Unauthorized reverse engineering or security testing of our infrastructure",
              "Use of the Platform in a manner that poses risk of harm to End Users",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] text-white/30 mt-3">
            Upon termination, all biometric data associated with your account will be permanently deleted within 30 days.
          </p>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Legal Contact" accent="#10b981">
          <p className="text-[12px] text-white/45 leading-relaxed">
            For legal inquiries, dispute notices, or DMCA reports, contact our legal team at{" "}
            <span className="font-mono text-[11px] text-emerald-400">legal@neoface.io</span>.
            For subpoenas or law enforcement requests, refer to our Law Enforcement Guidelines available at{" "}
            <span className="font-mono text-[11px] text-emerald-400">neoface.io/law-enforcement</span>.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
