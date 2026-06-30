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
            Compliance
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Security &{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)" }}>
              Compliance
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            NeoFace is designed to meet the security and regulatory requirements of the most demanding industries.
            From biometric data protection laws to financial sector controls, our compliance posture is continuously
            audited and publicly documented.
          </p>
        </div>

        {/* Certifications */}
        <SectionCard title="Active Certifications" accent="#a78bfa">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                cert: "SOC 2 Type II",
                badge: "Renewed Annually",
                auditor: "Ernst & Young",
                color: "#a78bfa",
                desc: "Covers Security, Availability, and Confidentiality trust service criteria. Report available under NDA to Enterprise customers.",
              },
              {
                cert: "ISO 27001:2022",
                badge: "Certified",
                auditor: "BSI Group",
                color: "#00E5A8",
                desc: "Information Security Management System covering our cloud platform, SDK development lifecycle, and key management operations.",
              },
              {
                cert: "GDPR",
                badge: "Compliant",
                auditor: "Internal DPA + External Counsel",
                color: "#3b82f6",
                desc: "Data Processing Agreements (DPAs) signed with all sub-processors. Data stays in your contracted region. Right to erasure enforced within 30 days.",
              },
              {
                cert: "HIPAA",
                badge: "BAA Available",
                auditor: "Self-Attested",
                color: "#10b981",
                desc: "Business Associate Agreements (BAAs) available for healthcare customers. PHI handling compliant with 45 CFR Part 164.",
              },
              {
                cert: "CCPA",
                badge: "Compliant",
                auditor: "External Privacy Counsel",
                color: "#f59e0b",
                desc: "California Consumer Privacy Act compliance for California-based end users. Opt-out and deletion rights honored within 15 days.",
              },
              {
                cert: "FIDO2 / WebAuthn",
                badge: "Certified",
                auditor: "FIDO Alliance",
                color: "#f43f5e",
                desc: "Platform authenticator certification for passkey-bound biometric verification. Tested against FIDO Conformance Tools.",
              },
            ].map((c) => (
              <div key={c.cert} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[12px] font-bold text-white">{c.cert}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{ color: c.color, borderColor: `${c.color}30`, background: `${c.color}10` }}>{c.badge}</span>
                </div>
                <p className="text-[10.5px] text-white/25 font-mono mb-2">Auditor: {c.auditor}</p>
                <p className="text-[11px] text-white/40 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Data Residency */}
        <SectionCard title="Data Residency & Regions" accent="#00E5A8">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Biometric data is processed and stored exclusively within your chosen deployment region.
            Data does not traverse regional boundaries at rest or in transit. Enclave clusters are 
            available in the following regions:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { region: "us-east-1", location: "N. Virginia, USA", status: "Available" },
              { region: "eu-west-1", location: "Dublin, Ireland (GDPR)", status: "Available" },
              { region: "ap-south-1", location: "Mumbai, India", status: "Available" },
              { region: "ap-southeast-1", location: "Singapore", status: "Available" },
              { region: "ca-central-1", location: "Montreal, Canada", status: "Available" },
              { region: "me-south-1", location: "Bahrain (DIFC)", status: "Coming Q4 2026" },
            ].map((r) => (
              <div key={r.region} className="p-3.5 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <code className="font-mono text-[10px] text-emerald-400 block mb-1">{r.region}</code>
                <div className="text-[11.5px] font-semibold text-white mb-0.5">{r.location}</div>
                <div className="text-[10px]" style={{ color: r.status === "Available" ? "#10b981" : "#f59e0b" }}>{r.status}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Pen Test */}
        <SectionCard title="Penetration Testing & Vulnerability Management" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace undergoes quarterly external penetration testing. Our scope includes:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {[
              "REST API endpoint fuzzing and injection testing",
              "Enclave attestation bypass attempts",
              "SDK binary analysis and tamper resistance",
              "Dashboard web application (OWASP Top 10)",
              "Network perimeter and infrastructure exposure",
              "Social engineering and phishing resistance",
            ].map((s) => (
              <div key={s} className="flex items-start gap-2 text-[11.5px] text-white/45">
                <span className="text-red-400 shrink-0 mt-0.5">→</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-white/35 leading-relaxed">
            Penetration test summary reports are available to Enterprise customers upon signing an NDA.
            Critical findings are remediated within 72 hours of disclosure.
          </p>
        </SectionCard>

        {/* Responsible Disclosure */}
        <SectionCard title="Responsible Disclosure Program" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace runs a responsible disclosure (bug bounty) program. Security researchers who discover
            vulnerabilities in our platform can report them to{" "}
            <span className="font-mono text-[11px] text-blue-400">security@neoface.io</span>. 
            We commit to acknowledging reports within 24 hours and providing remediation timelines within 5 business days.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { severity: "Critical (CVSS 9–10)", reward: "$5,000–$15,000", color: "#f43f5e" },
              { severity: "High (CVSS 7–8.9)", reward: "$1,000–$5,000", color: "#f59e0b" },
              { severity: "Medium (CVSS 4–6.9)", reward: "$200–$1,000", color: "#3b82f6" },
            ].map((b) => (
              <div key={b.severity} className="p-3.5 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-[13px] font-bold mb-1" style={{ color: b.color }}>{b.reward}</div>
                <p className="text-[10.5px] text-white/40">{b.severity}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Audit Logs */}
        <SectionCard title="Audit Logging" accent="#10b981">
          <p className="text-[12px] text-white/45 leading-relaxed">
            Every API call, identity change, webhook delivery, and dashboard login is recorded in immutable 
            audit logs. Logs are retained for 90 days by default (1 year for Enterprise plans) and are 
            exportable via the Dashboard or <code className="font-mono text-[11px] text-emerald-400">GET /v1/audit/logs</code> API endpoint.
            Logs include: timestamp, actor, action, IP address, user-agent, and response code.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
