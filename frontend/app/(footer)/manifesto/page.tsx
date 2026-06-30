"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

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
            Company Mission
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            The NeoFace{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)" }}>
              Manifesto
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Why we exist. Why passwords need to die. And why we believe identity should 
            belong to the person — not to the platform.
          </p>
        </div>

        {/* The Problem */}
        <SectionCard title="The Problem with Secrets" accent="#f43f5e">
          <div className="space-y-4 text-[12px] text-white/50 leading-relaxed">
            <p>
              Every authentication system built on secrets — passwords, PINs, OTP codes, security questions — 
              shares a fundamental flaw: <strong className="text-white">if a credential is transmittable, it is stealable.</strong>
            </p>
            <p>
              It does not matter how long or complex your password is. It can be phished. 
              It can be leaked in a database breach. It can be extracted from a compromised endpoint.
              And the world has spent 50 years building higher and higher walls around a broken foundation.
            </p>
            <p>
              In 2024 alone, over 8.2 billion credentials were exposed in data breaches globally.
              The identity security industry generates $15B+ per year in revenue — not solving the problem,
              but treating the symptoms of it.
            </p>
          </div>
        </SectionCard>

        {/* The Insight */}
        <SectionCard title="The Insight That Changes Everything" accent="#00E5A8">
          <div className="space-y-4 text-[12px] text-white/50 leading-relaxed">
            <p>
              A password can be stolen because it is a <em className="text-white/70">piece of information</em>.
              Information can be copied, transmitted, and forged.
            </p>
            <p>
              But your <strong className="text-white">biological identity</strong> — the unique geometry of your face, 
              the texture of your iris, the ridge patterns of your fingerprints — is not information.
              It is a physical property of your existence.
            </p>
            <p>
              You cannot phish a fingerprint. You cannot database-leak a live iris scan. You cannot social-engineer 
              someone&apos;s face geometry over a text message.
            </p>
            <p>
              The question was never <em className="text-white/70">&quot;can we use biometrics for authentication?&quot;</em>
              The question was: <strong className="text-white">how do we do it without creating an even worse problem —
              a centralized database of biometric data that becomes the world&apos;s most valuable hack target?</strong>
            </p>
          </div>
        </SectionCard>

        {/* The Solution */}
        <SectionCard title="Our Answer: Biometrics Without Databases" accent="#00C2FF">
          <div className="space-y-4 text-[12px] text-white/50 leading-relaxed">
            <p>
              NeoFace&apos;s architecture rests on two pillars:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-bold text-white mb-2">Zero-Knowledge Biometric Hashing</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  We transform biometric captures into one-way mathematical hashes that cannot be reversed
                  back into images or biological data. What we store is not a biometric — it is a number derived from one.
                </p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-bold text-white mb-2">Sovereign Secure Enclaves</h3>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  All matching logic runs inside hardware-isolated Trusted Execution Environments (TEEs).
                  These are sealed memory spaces that even we cannot access. The enclave knows only the 
                  result of the comparison — not the inputs.
                </p>
              </div>
            </div>
            <p>
              The result: a system where biometric authentication is possible, but biometric data harvesting 
              is architecturally impossible.
            </p>
          </div>
        </SectionCard>

        {/* Principles */}
        <SectionCard title="Our Four Founding Principles" accent="#a78bfa">
          <div className="space-y-4">
            {[
              {
                num: "I",
                principle: "Identity belongs to the individual.",
                detail: "No company, government, or platform should hold authority over a person's digital identity. Your biometrics should anchor your identity — not our database.",
              },
              {
                num: "II",
                principle: "Security through architecture, not policy.",
                detail: "Promises about data handling are worthless. Security guarantees must be mathematically enforced. If it is technically possible for us to access your data, we have failed.",
              },
              {
                num: "III",
                principle: "Privacy is not a feature — it is a right.",
                detail: "Zero-Knowledge design is not a premium add-on. Every user, on every tier, deserves the same privacy guarantees. We will never monetize user data.",
              },
              {
                num: "IV",
                principle: "Developers deserve better infrastructure.",
                detail: "The same way Stripe abstracted payments, we abstract identity. Authentication should be three API calls — not six months of security architecture work.",
              },
            ].map((p) => (
              <div key={p.num} className="p-4 rounded-xl border flex items-start gap-4" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <span className="font-mono text-[11px] text-purple-400 mt-0.5 shrink-0">{p.num}</span>
                <div>
                  <h3 className="text-[12px] font-semibold text-white mb-1.5">{p.principle}</h3>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Call */}
        <SectionCard title="Who This Is For" accent="#10b981">
          <div className="space-y-3 text-[12px] text-white/50 leading-relaxed">
            <p>
              NeoFace is built for builders — developers, security engineers, and product teams who are 
              tired of bolting authentication on as an afterthought. Who want to ship something that is 
              genuinely secure, not just compliant-enough.
            </p>
            <p>
              It is built for institutions — healthcare systems, financial services, and governments — that 
              handle sensitive populations and need audit-grade identity assurance without creating new 
              data liabilities.
            </p>
            <p>
              And it is built for the end user — the person who has had their password breached for the 
              sixth time, who is tired of 2FA codes, who deserves to authenticate with their face and 
              nothing else.
            </p>
            <p className="text-white/70 font-medium">
              The password era is ending. We are building what comes next.
            </p>
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
