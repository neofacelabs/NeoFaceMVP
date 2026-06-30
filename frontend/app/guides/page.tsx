"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#10b981",
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
            style={{ borderColor: "#10b98120", backgroundColor: "#10b98105", color: "#10b981" }}
          >
            Resources
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Integration{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #10b981, #00C2FF)" }}>
              Guides
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Step-by-step implementation walkthroughs for connecting NeoFace to your application.
            Each guide is targeted at a specific use case, compliance requirement, or integration pattern.
          </p>
        </div>

        {/* Framework Guides */}
        <SectionCard title="Framework-Specific Setup Guides" accent="#10b981">
          <div className="space-y-3">
            {[
              {
                framework: "Next.js (App Router)",
                duration: "~15 min",
                desc: "Add NeoFace face verification to a Next.js 14+ App Router application. Covers server component middleware, session token validation, and protected route guards.",
                tags: ["React", "Server Components", "TypeScript"],
              },
              {
                framework: "React Native + Expo",
                duration: "~20 min",
                desc: "Integrate on-device Face ID and camera liveness into a cross-platform React Native app. Includes camera permission handling and iOS/Android specific setup.",
                tags: ["React Native", "Expo", "iOS", "Android"],
              },
              {
                framework: "Flutter (iOS + Android)",
                duration: "~20 min",
                desc: "Use the NeoFace Flutter plugin to add biometric authentication to Dart applications. Native platform channel setup, secure storage, and token refresh cycle.",
                tags: ["Dart", "Flutter", "iOS", "Android"],
              },
              {
                framework: "Python / FastAPI Backend",
                duration: "~10 min",
                desc: "Set up server-side identity management with the Python SDK. Include webhook signature verification, async enrollment flows, and identity deletion handlers.",
                tags: ["Python", "FastAPI", "Backend"],
              },
            ].map((g) => (
              <div key={g.framework} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-[12px] font-semibold text-white">{g.framework}</h3>
                  <span className="font-mono text-[9.5px] text-emerald-400 border px-1.5 py-0.5 rounded" style={{ borderColor: "#10b98130", background: "#10b98108" }}>{g.duration}</span>
                </div>
                <p className="text-[11.5px] text-white/45 mb-3 leading-relaxed">{g.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.tags.map((t) => (
                    <span key={t} className="text-[9.5px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: "#ffffff0c", color: "#ffffff50", background: "#ffffff05" }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Compliance Guides */}
        <SectionCard title="Compliance Configuration Guides" accent="#a78bfa">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "GDPR Compliance Checklist",
                color: "#3b82f6",
                items: [
                  "Configure EU-only data residency (eu-west-1)",
                  "Implement consent capture UI before enrollment",
                  "Wire the /v1/identities/:id DELETE endpoint to user account closure",
                  "Sign a NeoFace DPA from the billing portal",
                  "Set 90-day session log retention (or shorter)",
                ],
              },
              {
                title: "HIPAA BAA Integration Guide",
                color: "#10b981",
                items: [
                  "Activate your HIPAA BAA from Dashboard → Legal",
                  "Ensure PHI is never included in user_ref or metadata fields",
                  "Enable enhanced audit logging (1-year retention)",
                  "Configure dedicated enclave region for healthcare data isolation",
                  "Enable HIPAA-mode webhook signing with RS256 instead of HMAC",
                ],
              },
              {
                title: "BIPA-Ready Deployment",
                color: "#f59e0b",
                items: [
                  "Display full biometric data disclosure before enrollment modal",
                  "Store signed consent records linked to identity_id",
                  "Enforce 3-year max retention via automated deletion schedules",
                  "Implement audit log export for regulatory review",
                ],
              },
              {
                title: "FIDO2 WebAuthn Integration",
                color: "#f43f5e",
                items: [
                  "Register a WebAuthn credential via navigator.credentials.create()",
                  "Link credential to NeoFace identity_id for dual-factor binding",
                  "Verify assertions with nfl.webauthn.verify() on subsequent logins",
                  "Handle authenticator counters to prevent replay attacks",
                ],
              },
            ].map((g) => (
              <div key={g.title} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold mb-3" style={{ color: g.color }}>{g.title}</h3>
                <ul className="space-y-1.5">
                  {g.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-white/45">
                      <span style={{ color: g.color }} className="mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Advanced Patterns */}
        <SectionCard title="Advanced Integration Patterns" accent="#00C2FF">
          <div className="space-y-3">
            {[
              {
                title: "Step-Up Authentication",
                desc: "Trigger biometric re-verification mid-session for high-risk operations (wire transfers, password changes). Use short-lived step-up tokens scoped to a single action.",
              },
              {
                title: "Continuous Authentication",
                desc: "Periodically re-verify user presence during extended sessions using passive face checks. Configurable polling interval from 30 seconds to 15 minutes depending on security requirements.",
              },
              {
                title: "Multi-Tenant Architecture",
                desc: "Isolate biometric identities across tenants using NeoFace Organizations. Each org gets its own enclave partition, separate API keys, and independent audit trail.",
              },
              {
                title: "Offline Verification Mode",
                desc: "For environments with intermittent connectivity, generate time-limited offline verification tokens using our Edge SDK. Tokens are signed cryptographically and validated on reconnection.",
              },
            ].map((p) => (
              <div key={p.title} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold text-white mb-1.5">{p.title}</h3>
                <p className="text-[11.5px] text-white/45 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
