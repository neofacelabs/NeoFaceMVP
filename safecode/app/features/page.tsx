"use client";
import React, { useState } from "react";
import SubpageLayout from "../components/SubpageLayout";
import BorderGlow from "../components/ui/BorderGlow";
import { motion } from "framer-motion";
import { ScanFace, Eye, Fingerprint, Cpu } from "lucide-react";

const FEATURES = [
  {
    title: "Face ID Ingestion",
    tag: "Face Auth",
    desc: "Verify user sessions under 150ms with 99.97% accuracy. Integrates passive liveness checks and advanced head-pose analysis to prevent photo spoofing.",
    icon: ScanFace
  },
  {
    title: "Iris Match Core",
    tag: "Iris Scan",
    desc: "Military-grade iris verification. Operates near-perfect discrimination against identical templates at standoff distance. Optimized for near-infrared sensors.",
    icon: Eye
  },
  {
    title: "Fingerprint Recognition",
    tag: "Frictionless Login",
    desc: "Secure multi-sensor fingerprint matching for frictionless sign-ins. Detects silicon, gelatin, and film print spoofing to block fake credential attempts.",
    icon: Fingerprint
  },
  {
    title: "Unified Biometric Fusion",
    tag: "Fusion Engine",
    desc: "Combines face recognition, iris scanning, and fingerprints into a single identity decision. Resolve complex biometric authorization requests via one API endpoint.",
    icon: Cpu
  }
];

export default function FeaturesPage() {
  return (
    <SubpageLayout>
      {/* Scope custom 3D card styles */}



      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]">
            Technology Features
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5 leading-tight">
            Concentric Biometric{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A8] to-[#00C2FF]">Authentication.</span>
          </h1>
          <p className="text-[14px] text-white/50 max-w-xl mx-auto leading-relaxed">
            Eliminate passwords, codes, and cookies. NeoFace Labs replaces standard credential vaults with live biometric session proofs.
          </p>
        </div>

        {/* Features Cards Grid (Flipping Effect) */}
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { ...FEATURES[0], accent: "#10b981", gradient: "linear-gradient(90deg, transparent, #10b981, #10b981, transparent)" },
            { ...FEATURES[1], accent: "#22d3ee", gradient: "linear-gradient(90deg, transparent, #22d3ee, #22d3ee, transparent)" },
            { ...FEATURES[2], accent: "#a78bfa", gradient: "linear-gradient(90deg, transparent, #a78bfa, #a78bfa, transparent)" },
            { ...FEATURES[3], accent: "#10b981", gradient: "linear-gradient(90deg, transparent, #10b981, #22d3ee, transparent)" }
          ].map((feat, idx) => (
            <div key={feat.title} className="group relative [perspective:1000px] w-full h-[340px]">
              <div className="w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[transform:rotateY(180deg)]">
                
                {/* Back (Unhovered View: Technical Scanner Graphics + Glow) */}
                <div className="biometric-card-back absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[28px] overflow-hidden flex items-center justify-center" style={{ "--glow-gradient": feat.gradient } as React.CSSProperties}>
                  <div className="absolute inset-[1px] bg-[#08080a] rounded-[27px] text-white flex flex-col justify-center items-center gap-3.5 z-10 overflow-hidden">
                    {/* Concentric Radar Rings */}
                    <div className="radar-ring radar-ring-1" />
                    <div className="radar-ring radar-ring-2" />
                    <div className="radar-ring radar-ring-3" />
                    
                    {/* Moving Laser Sweep Line */}
                    <div 
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--laser-color)] to-transparent pointer-events-none"
                      style={{ 
                        top: '0', 
                        animation: 'scan_line 3s ease-in-out infinite', 
                        '--laser-color': feat.accent 
                      } as React.CSSProperties} 
                    />

                    {/* Scanner Center Target Icon */}
                    <div 
                      className="p-4 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center relative z-20 shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                      style={{ boxShadow: `0 0 40px -10px ${feat.accent}30` }}
                    >
                      <feat.icon className="w-10 h-10" style={{ filter: `drop-shadow(0 0 10px ${feat.accent}35)`, color: feat.accent }} />
                    </div>

                    <div className="text-center relative z-20 px-4 mt-1">
                      <div className="font-sans font-black text-white tracking-tight mb-1" style={{ fontSize: '18px' }}>
                        {feat.title}
                      </div>
                      <div className="font-mono tracking-widest uppercase font-bold text-[9px]" style={{ color: feat.accent }}>
                        [ DETECTOR ACTIVE ]
                      </div>
                    </div>

                    <span className="text-[8.5px] font-mono text-white/30 tracking-wider font-semibold bg-white/[0.03] border border-white/[0.04] px-3.5 py-1 rounded-full uppercase mt-1 relative z-20">
                      Hover to reveal specs
                    </span>
                  </div>
                </div>

                {/* Front (Hovered View: Readable details & API info) */}
                <div className="biometric-card-front absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[28px] overflow-hidden [transform:rotateY(180deg)] bg-[#0c0c0f] border border-white/[0.12] text-white">
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="font-mono font-bold uppercase tracking-[0.15em] px-3.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05]" style={{ fontSize: '9px', color: feat.accent }}>
                          {feat.tag}
                        </div>
                        <feat.icon className="w-5 h-5" style={{ color: feat.accent }} />
                      </div>
                      
                      <div className="font-black text-white tracking-tight leading-tight mb-2" style={{ fontSize: '18px', lineHeight: '1.25' }}>
                        {feat.title}
                      </div>
                      
                      <p className="font-sans font-light leading-relaxed text-white/70" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {feat.desc}
                      </p>
                    </div>

                    <div>
                      <div className="w-full h-px bg-white/5 mb-3" />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white/20" style={{ fontSize: '9px' }}>NFL_VERIFY_ENDPOINT</span>
                        <a href="/about" className="font-bold text-white hover:text-[#00E5A8] transition-colors flex items-center gap-1 font-sans" style={{ fontSize: '11px' }}>
                          API Reference
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* ── SDK QUICKSTART ── */}
        <div className="mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-[#00C2FF]/20 bg-[#00C2FF]/5 text-[#00C2FF]">
              SDK Quickstart
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ship in minutes, not weeks.
            </h2>
            <p className="text-[14px] text-white/40 max-w-md mx-auto">Install the SDK and make your first verified biometric call in under 5 minutes.</p>
          </div>

          <QuickstartBlock />
        </div>

      </div>

      {/* ── COMPARISON TABLE ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 mt-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-[#a78bfa]/20 bg-[#a78bfa]/5 text-[#a78bfa]">
            Why NeoFace
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            How it stacks up.
          </h2>
        </div>
        <ComparisonTable />
      </div>

      <div className="max-w-4xl mx-auto">

        {/* ── PLATFORM SUPPORT ── */}
        <div className="mt-24 mb-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Works everywhere your users are.</h2>
            <p className="text-[13px] text-white/35">Native SDKs. Universal APIs. One biometric layer for every platform.</p>
          </div>
          <PlatformBadges />
        </div>

      </div>
    </SubpageLayout>
  );
}

/* ── Quickstart Block ── */
const INSTALL_STEPS = [
  { step: "01", label: "Install", code: "npm install @neoface/sdk" },
  { step: "02", label: "Init", code: `import { NeoFace } from '@neoface/sdk';\nconst nfl = new NeoFace({ apiKey: 'NFL_KEY' });` },
  { step: "03", label: "Verify", code: `const r = await nfl.verify({\n  userId: 'usr_abc',\n  modalities: ['face', 'liveness'],\n});\n// r.verified → true` },
];

function QuickstartBlock() {
  const [copied, setCopied] = useState<number | null>(null);
  const copy = (i: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {INSTALL_STEPS.map((s, i) => {
        const indexHsl = i === 0 ? "194 100 50" : i === 1 ? "160 85 45" : "258 90 75";
        const indexColor = i === 0 ? "#22d3ee" : i === 1 ? "#10b981" : "#a78bfa";
        return (
          <motion.div key={i} whileHover={{ y: -4 }} className="h-full flex flex-col">
            <BorderGlow
              className="h-full"
              edgeSensitivity={20}
              glowColor={indexHsl}
              backgroundColor="#09090b"
              borderRadius={28}
              glowRadius={35}
              glowIntensity={0.8}
              colors={[indexColor, `${indexColor}88`, '#050505']}
              fillOpacity={0.1}
            >
              <div className="h-full flex flex-col justify-between relative z-10 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3">
                  <span className="text-[10px] font-mono text-white/35 font-bold uppercase tracking-wider">Step {s.step} — {s.label}</span>
                  <button onClick={() => copy(i, s.code)} className="text-[10px] font-mono font-bold text-white/30 hover:text-[#00E5A8] transition-colors">
                    {copied === i ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <pre className="p-5 text-[12px] font-mono text-white/70 leading-relaxed whitespace-pre-wrap break-all flex-1 bg-black/35">
                  <code>{s.code}</code>
                </pre>
              </div>
            </BorderGlow>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Comparison Table ── */
const COMPARE_ROWS = [
  { feature: "Phishing resistant",         nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Credential-less auth",       nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Liveness detection",         nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Passive verification",       nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Zero knowledge proofs",      nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Hardware enclave backed",    nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "SOC 2 / ISO 27001 ready",    nfl: true,  pwd: false, otp: true,  totp: true  },
  { feature: "FIDO2 / WebAuthn support",   nfl: true,  pwd: false, otp: false, totp: false },
  { feature: "Sub-100ms latency",          nfl: true,  pwd: true,  otp: false, totp: false },
  { feature: "No shared secret stored",    nfl: true,  pwd: false, otp: false, totp: false },
];

function ComparisonTable() {
  return (
    <div className="w-full space-y-4">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-8 py-5.5 border border-white/[0.05] bg-white/[0.01] rounded-[22px] items-center">
        <div className="col-span-6 text-left text-white/35 font-mono uppercase tracking-widest text-[10px] font-bold">Feature</div>
        <div className="col-span-2 text-center text-[#00E5A8] font-black text-[14.5px] font-sans tracking-tight">NeoFace</div>
        <div className="col-span-2 text-center text-white/45 font-semibold text-[13.5px] font-sans">Password</div>
        <div className="col-span-1 text-center text-white/45 font-semibold text-[13.5px] font-sans">OTP SMS</div>
        <div className="col-span-1 text-center text-white/45 font-semibold text-[13.5px] font-sans">TOTP App</div>
      </div>

      {/* Body Rows */}
      {COMPARE_ROWS.map((row, idx) => (
        <div 
          key={idx} 
          className="grid grid-cols-12 gap-4 px-8 py-6 rounded-[22px] bg-[#09090b] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.01] transition-all duration-200 items-center shadow-lg"
        >
          <div className="col-span-6 text-left text-white/90 font-sans font-semibold text-[14.5px] tracking-tight">{row.feature}</div>
          
          {/* NeoFace Cell */}
          <div className="col-span-2 flex justify-center bg-[#00E5A8]/[0.01] py-1 rounded-xl">
            {row.nfl ? (
              <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-[#00E5A8] shadow-[0_0_12px_rgba(0,229,168,0.25)]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
            )}
          </div>

          {/* Password Cell */}
          <div className="col-span-2 flex justify-center">
            {row.pwd ? (
              <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-white/10 border border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
            )}
          </div>

          {/* OTP Cell */}
          <div className="col-span-1 flex justify-center">
            {row.otp ? (
              <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-white/10 border border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
            )}
          </div>

          {/* TOTP Cell */}
          <div className="col-span-1 flex justify-center">
            {row.totp ? (
              <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-white/10 border border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Platform Badges ── */
const PLATFORMS = [
  { name: "iOS / Swift", icon: "🍎" },
  { name: "Android / Kotlin", icon: "🤖" },
  { name: "React Native", icon: "⚛️" },
  { name: "Flutter", icon: "🐦" },
  { name: "Web / JS", icon: "🌐" },
  { name: "Python", icon: "🐍" },
  { name: "Go", icon: "🔵" },
  { name: "REST API", icon: "🔌" },
];

function PlatformBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {PLATFORMS.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-white/[0.07] bg-white/[0.02] hover:border-[#00E5A8]/25 hover:bg-[#00E5A8]/[0.03] transition-all duration-300 cursor-default"
        >
          <span className="text-lg">{p.icon}</span>
          <span className="text-[13px] font-medium text-white/60 hover:text-white/90 transition-colors">{p.name}</span>
        </div>
      ))}
    </div>
  );
}
