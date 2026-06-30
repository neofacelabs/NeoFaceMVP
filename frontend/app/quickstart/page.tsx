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
            Developers
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Quick Start{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #10b981, #00C2FF)" }}>
              Guide
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Go from zero to a fully working biometric verification in under 5 minutes.
            This guide walks through account creation, SDK installation, API key configuration, 
            and your first successful identity assertion.
          </p>
        </div>

        {/* Prerequisites */}
        <SectionCard title="Prerequisites" accent="#10b981">
          <ul className="space-y-2 text-[12px] text-white/50">
            {[
              "A NeoFace Labs account (free tier available, no credit card required)",
              "Node.js 18+ or Python 3.10+ installed",
              "A camera-capable device for the live verification test",
              "An internet connection to reach the NeoFace Sandbox API",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Step 1 */}
        <SectionCard title="Step 1 — Create Your Project & API Key" accent="#00E5A8">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Log in to the NeoFace Dashboard, navigate to <strong className="text-white">Projects → New Project</strong>, 
            give it a name, and select your default region (us-east-1 recommended for lowest latency globally).
            Then go to <strong className="text-white">API Keys → Generate Key</strong> to receive your secret key.
          </p>
          <div className="p-3.5 rounded-xl border flex items-center gap-3" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
            <span className="text-[10px] font-mono text-white/25">SANDBOX KEY</span>
            <code className="font-mono text-[11.5px] text-emerald-400">nfl_sandbox_sk_••••••••••••••••</code>
          </div>
          <p className="text-[10.5px] text-white/25 mt-2">
            Keep your secret key confidential. Never expose it in client-side code or commit it to version control.
          </p>
        </SectionCard>

        {/* Step 2 */}
        <SectionCard title="Step 2 — Install the SDK" accent="#00C2FF">
          <div className="space-y-3">
            {[
              { lang: "Node.js / TypeScript", cmd: "npm install @neoface/sdk" },
              { lang: "Python", cmd: "pip install neoface-sdk" },
              { lang: "React Native", cmd: "npx expo install @neoface/react-native" },
            ].map((s) => (
              <div key={s.lang}>
                <p className="text-[10.5px] text-white/30 mb-1 font-mono">{s.lang}</p>
                <pre className="p-3 rounded-xl text-[11.5px] font-mono text-blue-300" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
                  {s.cmd}
                </pre>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 3 */}
        <SectionCard title="Step 3 — Initialize & Enroll an Identity" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Initialize the client with your API key and enroll a new identity by passing a captured face image.
            The SDK handles base64 encoding, request signing, and error retries automatically.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`import { NeoFace } from '@neoface/sdk';

const nfl = new NeoFace({ 
  apiKey: process.env.NEOFACE_API_KEY,
  env: 'sandbox' 
});

// Enroll a new user identity
const enrollment = await nfl.identities.enroll({
  userRef: 'usr_12345',
  capture: {
    faceDataUri: imageDataUri,   // data:image/jpeg;base64,...
    modalities: ['face', 'liveness']
  }
});

console.log(enrollment.identityId);  // id_01JYNXKGM4...
console.log(enrollment.enrolledAt);  // 2026-07-01T00:47:58Z`}
          </pre>
        </SectionCard>

        {/* Step 4 */}
        <SectionCard title="Step 4 — Verify an Identity" accent="#f59e0b">
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`// On login — verify the user's live face against stored template
const result = await nfl.identities.verify({
  identityId: enrollment.identityId,
  capture: {
    faceDataUri: liveImageDataUri,
    modalities: ['face', 'liveness']
  }
});

if (result.verified && result.trustScore >= 0.92) {
  console.log('✓ Identity confirmed');
  console.log('Trust score:', result.trustScore);   // 0.97
  console.log('Session ID:', result.sessionId);     // sess_0xA1F2C3
} else {
  console.log('✗ Verification failed');
}`}
          </pre>
        </SectionCard>

        {/* Next Steps */}
        <SectionCard title="What to Explore Next" accent="#f43f5e">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Webhooks", desc: "Subscribe to verification events and sync NeoFace outcomes with your backend in real time." },
              { title: "Trust Engine", desc: "Configure minimum trust score thresholds and anti-spoofing sensitivity per use case." },
              { title: "Rate Limits", desc: "Understand your tier's request quotas and implement proper backoff strategies." },
              { title: "API Reference", desc: "Explore all REST endpoints, request schemas, error codes, and response formats." },
            ].map((n) => (
              <div key={n.title} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold text-white mb-1">{n.title}</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
