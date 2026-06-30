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
            Security
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Security{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)" }}>
              Overview
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            NeoFace is architected on the principle that biometric data must never be centralized.
            Every design decision — from our enclave isolation model to our cryptographic hashing pipeline —
            is engineered to ensure that even NeoFace employees cannot access your users&apos; biometrics.
          </p>
        </div>

        {/* Architecture */}
        <SectionCard title="Zero-Knowledge Biometric Architecture" accent="#00E5A8">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {[
              { step: "01", label: "Capture", desc: "Camera capture happens on-device. Raw images never leave the user's hardware." },
              { step: "02", label: "Extract", desc: "A mathematical geometric descriptor is computed locally using our on-device SDK." },
              { step: "03", label: "Hash & Store", desc: "The descriptor is homomorphically hashed and transmitted to the enclave. Original data discarded." },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="font-mono text-[10px] text-white/25 mb-2">{s.step}</div>
                <div className="text-[12px] font-bold text-white mb-1">{s.label}</div>
                <p className="text-[11px] text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-white/40 leading-relaxed">
            Matching algorithms execute entirely within hardware-isolated secure enclaves (AWS Nitro Enclaves, Intel SGX).
            The enclave has no network access, no persistent storage, and no external API calls.
            Biometric comparisons are done in enclave memory and the result (a boolean + score) is returned — never the template itself.
          </p>
        </SectionCard>

        {/* Encryption */}
        <SectionCard title="Encryption Standards" accent="#00C2FF">
          <div className="space-y-3">
            {[
              { label: "Data in Transit", algo: "TLS 1.3 with AES-256-GCM", desc: "All API traffic is encrypted end-to-end. TLS 1.2 is disabled across all endpoints." },
              { label: "Template Storage", algo: "AES-256 + Homomorphic Encryption", desc: "Biometric templates are stored in encrypted form that allows matching without decryption." },
              { label: "Key Management", algo: "AWS KMS with HSM backing", desc: "Encryption keys are stored in FIPS 140-2 Level 3 certified HSMs. Root keys are rotated annually." },
              { label: "Token Signing", algo: "ECDSA P-256 / RS256 JWTs", desc: "All session tokens are cryptographically signed. Symmetric shared secrets are never used." },
            ].map((e) => (
              <div key={e.label} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[12px] font-semibold text-white">{e.label}</span>
                  <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded border" style={{ borderColor: "#00C2FF30", background: "#00C2FF08", color: "#00C2FF" }}>{e.algo}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Trust Boundaries */}
        <SectionCard title="Trust Boundaries & Threat Model" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Our threat model explicitly accounts for insider threats, cloud provider compromise, and API-layer attacks.
            The architecture ensures that breaching any single component cannot expose raw biometric data.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { threat: "Insider Threat", mitigation: "Enclave memory is inaccessible to any NeoFace engineer. Zero-trust IAM with hardware 2FA and audit logging." },
              { threat: "Database Breach", mitigation: "Only homomorphic hashes stored in databases. Hashes cannot be reversed to original biometrics." },
              { threat: "Man-in-the-Middle", mitigation: "TLS 1.3 with certificate pinning in all mobile SDKs. HSTS enforced on all web endpoints." },
              { threat: "Presentation Attacks", mitigation: "Multi-modal liveness + depth analysis rejects printed photos, screens, silicone masks, and injection attacks." },
            ].map((t) => (
              <div key={t.threat} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[11.5px] font-semibold text-red-400 mb-1.5">{t.threat}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{t.mitigation}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Certifications */}
        <SectionCard title="Certifications & Audits" accent="#f59e0b">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { cert: "SOC 2 Type II", auditor: "Ernst & Young", desc: "Annual audit covering security, availability, and confidentiality trust service criteria." },
              { cert: "ISO 27001:2022", auditor: "BSI Group", desc: "Certified ISMS covering cloud engineering, key management, and enclave operations." },
              { cert: "GDPR Compliant", auditor: "Internal DPA", desc: "Data processing agreements available. No personal data transferred outside agreed regions." },
            ].map((c) => (
              <div key={c.cert} className="p-4 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-[12px] font-bold text-amber-400 mb-1">{c.cert}</div>
                <div className="text-[10px] text-white/30 font-mono mb-2">{c.auditor}</div>
                <p className="text-[11px] text-white/40 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Pen Tests */}
        <SectionCard title="Penetration Testing" accent="#f43f5e">
          <p className="text-[12px] text-white/45 leading-relaxed">
            NeoFace conducts quarterly external penetration tests conducted by independent security firms.
            Test scope includes API endpoints, enclave attack surface, SDK binary analysis, and 
            web dashboard application layers. Summary reports are available to Enterprise customers 
            under NDA via the Trust Center.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
