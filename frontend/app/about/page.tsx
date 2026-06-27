"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";
import BorderGlow from "../components/ui/BorderGlow";
import { motion } from "framer-motion";

const PILLARS = [
  {
    tag: "Core Belief",
    title: "Passwords are a design flaw, not a feature.",
    desc: "The password was invented in 1961. The internet of 2026 runs on authentication infrastructure designed before colour television was common. NeoFace exists to fix this at the protocol level — not patch it.",
    accent: "#00E5A8",
  },
  {
    tag: "Architecture",
    title: "The human IS the credential.",
    desc: "Every NeoFace session is anchored to the physical presence of a verified person. Face geometry, iris texture, and behavioral signals are fused into a one-way cryptographic proof. Nothing raw is ever stored. Nothing can be stolen.",
    accent: "#00C2FF",
  },
  {
    tag: "Trust Model",
    title: "Zero-knowledge by default.",
    desc: "Our matching engine operates inside hardware-backed secure enclaves (TEEs). We prove identity without ever seeing your biometric data — mathematically verifiable, not just promised in a privacy policy.",
    accent: "#a78bfa",
  },
];

const PROBLEMS = [
  {
    stat: "15B+",
    label: "credentials compromised",
    desc: "Records leaked in the last decade from password-based auth systems.",
  },
  {
    stat: "83%",
    label: "of breaches involve stolen credentials",
    desc: "The Verizon DBIR 2024. The attack vector has never changed.",
  },
  {
    stat: "$9.4M",
    label: "average cost per breach",
    desc: "For a US enterprise. Credential attacks are now the highest-ROI crime on the internet.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Enroll once.",
    desc: "A user's face geometry, iris texture, and fingerprint whorls are ingested over your existing camera or hardware. The raw image is immediately discarded. Only a mathematical template is produced.",
  },
  {
    step: "02",
    title: "Hash it into a vault.",
    desc: "The template is transformed using homomorphic one-way hashing and stored inside an HSM-backed enclave. It can never be reversed into a biometric, shared with third parties, or extracted — even by NeoFace.",
  },
  {
    step: "03",
    title: "Verify every session, in real time.",
    desc: "Every login or transaction triggers a fresh passive liveness capture. The new biometric is compared against the stored hash inside the enclave. The result is a signed boolean: verified or not. No image ever leaves the device.",
  },
  {
    step: "04",
    title: "Continuous, not one-shot.",
    desc: "Unlike passwords or OTPs, NeoFace stays active throughout a session — detecting deepfakes, device handoff, or face swaps in real time. Security that does not end at login.",
  },
];

const WHY_NOW = [
  {
    icon: "📱",
    title: "Every device has a camera.",
    desc: "Face ID hardware is now standard on 90%+ of smartphones shipped globally. The deployment cost of biometrics is effectively zero.",
  },
  {
    icon: "🤖",
    title: "AI deepfakes changed the threat model.",
    desc: "Static liveness checks and 2FA OTPs are no longer sufficient. Deepfake injection attacks, SIM-swap fraud, and voice cloning require active, continuous identity verification.",
  },
  {
    icon: "🏛️",
    title: "Regulation is arriving.",
    desc: "DPDP Act (India), eIDAS 2.0 (EU), and NIST SP 800-63B are all moving toward biometric-backed identity. Compliance will require it — NeoFace makes it trivial.",
  },
  {
    icon: "⚡",
    title: "The cost dropped to zero.",
    desc: "TEE and HSM hardware costs fell 90% since 2019. Running a sovereign, hardware-backed biometric enclave is now cheaper than a legacy OTP SMS gateway.",
  },
];

export default function AboutPage() {
  return (
    <SubpageLayout>
      {/* All sections use max-w-4xl so they stay within SubpageLayout's own horizontal padding */}
      <div className="max-w-4xl mx-auto">

        {/* ── HERO ── */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]">
            Our Mission
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            The world&apos;s identity infrastructure is broken.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A8] to-[#00C2FF]">
              We&apos;re rebuilding it.
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            NeoFace Labs is building the biometric identity layer for modern software. One API that replaces passwords, OTPs, and static credentials with live, continuous, hardware-backed proof that the right human is present — every session, every transaction, every time.
          </p>
        </div>

        {/* ── THE PROBLEM ── */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border border-red-500/20 bg-red-500/5 text-red-400">
            The Problem
          </div>
          <h2 className="text-[19px] md:text-[23px] font-bold text-white tracking-tight mb-3 leading-snug">
            Credentials are the #1 attack surface on the internet.
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-8 max-w-2xl font-light">
            Every enterprise breach, every account takeover, every SIM-swap fraud traces back to the same root cause: authentication is based on something you know, not something you are. Secrets can be stolen. Identity cannot.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { ...PROBLEMS[0], accent: "#f43f5e", glowHsl: "350 90 60" },
              { ...PROBLEMS[1], accent: "#22d3ee", glowHsl: "194 100 50" },
              { ...PROBLEMS[2], accent: "#10b981", glowHsl: "160 85 45" }
            ].map((p, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }} className="h-full flex flex-col">
                <BorderGlow
                  className="h-full"
                  edgeSensitivity={20}
                  glowColor={p.glowHsl}
                  backgroundColor="#09090b"
                  borderRadius={24}
                  glowRadius={35}
                  glowIntensity={0.8}
                  colors={[p.accent, `${p.accent}88`, '#050505']}
                  fillOpacity={0.12}
                >
                  <div className="p-6.5 flex flex-col justify-between h-full relative z-10">
                    <div>
                      <div className="text-2xl font-black text-white mb-1.5 tracking-tight">{p.stat}</div>
                      <div className="text-[9px] font-mono font-bold text-red-400/80 uppercase tracking-wider mb-3.5">{p.label}</div>
                      <p className="text-[12px] text-white/45 leading-relaxed font-sans font-light">{p.desc}</p>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/[0.05] mb-16" />

        {/* ── OUR ANSWER ── */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]">
            Our Answer
          </div>
          <h2 className="text-[19px] md:text-[23px] font-bold text-white tracking-tight mb-3 leading-snug">
            Make the human the credential.
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-8 max-w-2xl font-light">
            NeoFace replaces the entire credential stack — passwords, OTPs, TOTP apps, magic links — with a single biometric verification call. No shared secrets. No phishable codes. No stored images. Just a cryptographic proof that a live, verified human is present.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { ...PILLARS[0], accentColor: "#10b981", glowHsl: "160 85 45" },
              { ...PILLARS[1], accentColor: "#22d3ee", glowHsl: "194 100 50" },
              { ...PILLARS[2], accentColor: "#a78bfa", glowHsl: "258 90 75" }
            ].map((pillar, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }} className="h-full flex flex-col">
                <BorderGlow
                  className="h-full"
                  edgeSensitivity={20}
                  glowColor={pillar.glowHsl}
                  backgroundColor="#09090b"
                  borderRadius={24}
                  glowRadius={35}
                  glowIntensity={0.8}
                  colors={[pillar.accentColor, `${pillar.accentColor}88`, '#050505']}
                  fillOpacity={0.12}
                >
                  <div className="p-6.5 flex flex-col justify-between h-full relative z-10">
                    <div>
                      <div
                        className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-4"
                        style={{ color: pillar.accentColor }}
                      >
                        {pillar.tag}
                      </div>
                      <div className="text-[13.5px] font-bold text-white mb-2 leading-snug">{pillar.title}</div>
                      <p className="text-[12px] text-white/45 leading-relaxed font-sans font-light">{pillar.desc}</p>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/[0.05] mb-16" />

        {/* ── HOW IT WORKS ── */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#00C2FF]/20 bg-[#00C2FF]/5 text-[#00C2FF]">
            How It Works
          </div>
          <h2 className="text-[19px] md:text-[23px] font-bold text-white tracking-tight mb-3 leading-snug">
            Four steps. Zero secrets.
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-8 max-w-2xl font-light">
            The entire NeoFace pipeline is built around a single principle: identity must be provable without being transferable. Here is exactly how we enforce that.
          </p>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const accent = isEven ? "#22d3ee" : "#10b981";
              const glowHsl = isEven ? "194 100 50" : "160 85 45";

              return (
                <motion.div key={step.step} whileHover={{ x: 4 }} className="w-full">
                  <BorderGlow
                    className="w-full"
                    edgeSensitivity={20}
                    glowColor={glowHsl}
                    backgroundColor="#09090b"
                    borderRadius={20}
                    glowRadius={30}
                    glowIntensity={0.6}
                    colors={[accent, `${accent}66`, '#050505']}
                    fillOpacity={0.1}
                  >
                    <div className="p-5.5 flex gap-5.5 items-start relative z-10">
                      <div className="text-[11px] font-mono font-black text-white/35 transition-colors duration-300 w-6 pt-0.5 select-none">
                        {step.step}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold text-white mb-1">{step.title}</div>
                        <p className="text-[12px] text-white/45 leading-relaxed font-sans font-light">{step.desc}</p>
                      </div>
                    </div>
                  </BorderGlow>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-white/[0.05] mb-16" />

        {/* ── WHY NOW ── */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#a78bfa]/20 bg-[#a78bfa]/5 text-[#a78bfa]">
            Why Now
          </div>
          <h2 className="text-[19px] md:text-[23px] font-bold text-white tracking-tight mb-3 leading-snug">
            The conditions for this to work finally exist.
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-8 max-w-2xl font-light">
            Biometrics have been theoretically superior to passwords for decades. What changed is the convergence of four forces that make NeoFace commercially viable and technically irreplaceable right now.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {WHY_NOW.map((item, idx) => (
              <motion.div key={item.title} whileHover={{ y: -4 }} className="h-full flex flex-col">
                <BorderGlow
                  className="h-full"
                  edgeSensitivity={20}
                  glowColor="258 90 75"
                  backgroundColor="#09090b"
                  borderRadius={24}
                  glowRadius={35}
                  glowIntensity={0.8}
                  colors={['#a78bfa', '#a78bfa88', '#050505']}
                  fillOpacity={0.12}
                >
                  <div className="p-6.5 flex gap-5 items-start relative z-10">
                    <div className="text-xl flex-shrink-0 select-none">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-bold text-white mb-1">{item.title}</div>
                      <p className="text-[12px] text-white/45 leading-relaxed font-sans font-light">{item.desc}</p>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/[0.05] mb-16" />

        {/* ── MANIFESTO QUOTE ── */}
        <div className="mb-16">
          <div className="text-4xl font-serif text-[#00E5A8]/15 mb-2 leading-none">&ldquo;</div>
          <p className="text-[15px] md:text-[17px] font-semibold text-white/80 leading-relaxed mb-6">
            Security that works by keeping secrets is fundamentally fragile. Security that works by verifying presence is fundamentally unbreakable. NeoFace is the transition layer between those two worlds.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-[#00E5A8]/40" />
            <div>
              <div className="text-[12px] font-semibold text-white/60">Divye Bhatnagar</div>
              <div className="text-[10px] font-mono text-white/30">Founder, NeoFace Labs</div>
            </div>
          </div>
        </div>

        {/* ── COMPLIANCE STRIP ── */}
        <div className="w-full h-px bg-white/[0.05] mb-10" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-4">
          {[
            { label: "SOC 2 Type II", sub: "Certified" },
            { label: "GDPR", sub: "Compliant" },
            { label: "ISO 27001", sub: "Accredited" },
            { label: "FIDO2", sub: "Certified" },
            { label: "PCI DSS", sub: "Level 1" },
            { label: "HIPAA", sub: "Ready" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-1.5 text-[11px] font-mono text-white/25 hover:text-white/50 transition-colors cursor-default">
              <span className="text-[#00E5A8]/60">✓</span>
              <span>{badge.label}</span>
              <span className="text-white/15 mx-0.5">·</span>
              <span className="text-white/20">{badge.sub}</span>
            </div>
          ))}
        </div>

      </div>
    </SubpageLayout>
  );
}
