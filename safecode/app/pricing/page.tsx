"use client";
import React, { useState } from "react";
import SubpageLayout from "../components/SubpageLayout";
import BorderGlow from "../components/ui/BorderGlow";
import { motion } from "framer-motion";

const PLANS = [
  {
    name: "Starter",
    priceMonthly: "₹0",
    priceAnnual: "₹0",
    desc: "For developers building their first identity-aware biometric application.",
    color: "#00E5A8",
    cta: "Start Free",
    features: [
      "1,000 API verification requests/mo",
      "Face authentication & liveness checks",
      "Iris & fingerprint template ingestion",
      "WebAuthn / Passkeys integration",
      "1 active deployment project",
      "Developer dashboard access",
      "99.9% uptime SLA guarantee",
      "Rate limited at 10 requests/sec"
    ]
  },
  {
    name: "Pro",
    priceMonthly: "₹12,500",
    priceAnnual: "₹10,000",
    desc: "For growing teams shipping production biometric identity infrastructure.",
    color: "#00C2FF",
    cta: "Start Pro Trial",
    badge: "Most Popular",
    highlight: true,
    features: [
      "100,000 API verification requests/mo",
      "Everything in Starter plan",
      "Concentric Risk Assessment Engine",
      "Real-time fraud & spoof scoring",
      "Multi-sensor hardware trust fusion",
      "5 active deployment projects",
      "Webhook event notifications",
      "Advanced log dashboard & search",
      "99.95% uptime SLA guarantee",
      "Custom domain mapping"
    ]
  },
  {
    name: "Enterprise",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    desc: "For enterprise-grade identity orchestration and transaction volume at scale.",
    color: "#a78bfa",
    cta: "Contact Sales",
    features: [
      "Unlimited API verification requests",
      "Everything in Pro plan",
      "Dedicated sovereign infrastructure",
      "Audit log SIEM integration",
      "On-premise hardware HSM deployment",
      "Custom model training & tuning",
      "Dedicated success managers",
      "SoC 2 Type II compliance reports",
      "99.99% uptime custom SLA"
    ]
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <SubpageLayout>
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-[#00C2FF]/20 bg-[#00C2FF]/5 text-[#00C2FF]">
            Predictable Pricing
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5 leading-tight">
            Predictable Plans for{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#00E5A8]">Identity Trust.</span>
          </h1>
          <p className="text-[14px] text-white/50 max-w-xl mx-auto leading-relaxed">
            Start completely free. Integrate biometric face, iris, and fingerprint authentication with three lines of code. Scale with custom enclaves.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className={`text-[13px] ${!annual ? "text-white font-medium" : "text-white/40"}`}>Monthly billing</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="relative w-12 h-6.5 rounded-full border border-white/10 transition-colors bg-white/5"
            >
              <div 
                className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5" 
                style={{ transform: annual ? "translateX(24px)" : "translateX(0)" }}
              />
            </button>
            <span className={`text-[13px] ${annual ? "text-white font-medium" : "text-white/40"}`}>
              Annual billing <span className="text-[#00E5A8] ml-1 font-semibold text-[11px]">[Save 20%]</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {[
            { ...PLANS[0], accent: "#10b981", glowHsl: "160 85 45" },
            { ...PLANS[1], accent: "#22d3ee", glowHsl: "194 100 50" },
            { ...PLANS[2], accent: "#a78bfa", glowHsl: "258 90 75" }
          ].map((plan) => (
            <motion.div key={plan.name} whileHover={{ y: -6 }} className="h-full flex flex-col">
              <BorderGlow
                className="h-full"
                edgeSensitivity={plan.highlight ? 30 : 20}
                glowColor={plan.glowHsl}
                backgroundColor="#09090b"
                borderRadius={40}
                glowRadius={plan.highlight ? 50 : 40}
                glowIntensity={plan.highlight ? 1.0 : 0.8}
                colors={[plan.accent, `${plan.accent}88`, '#050505']}
                fillOpacity={plan.highlight ? 0.2 : 0.12}
              >
                <div className="p-8 flex flex-col justify-between h-full relative z-10">
                  {plan.badge && (
                    <div className="absolute top-4 right-4 bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF] text-[9px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Title */}
                    <div className="text-xl font-extrabold text-white mb-2">{plan.name}</div>
                    <p className="text-[12.5px] text-white/50 leading-relaxed mb-6 font-sans font-light">{plan.desc}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-3xl font-bold font-mono text-white">
                        {annual ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      {plan.priceMonthly !== "Custom" && plan.priceMonthly !== "₹0" && (
                        <span className="text-[12.5px] text-white/30">/month</span>
                      )}
                    </div>

                    {/* Features divider */}
                    <div className="w-full h-px bg-white/5 mb-6" />

                    {/* Features List */}
                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-[12.5px] text-white/70">
                          <svg className="w-4 h-4 text-[#00E5A8] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-sans font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <a 
                    href={plan.name === "Enterprise" ? "mailto:sales@neoface.io" : "/register"}
                    className="w-full py-3 rounded-full text-center text-[12px] font-mono uppercase tracking-wider font-bold transition-all duration-300 block"
                    style={{
                      backgroundColor: plan.highlight ? plan.accent : "transparent",
                      color: plan.highlight ? "#000" : "#fff",
                      border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.15)"
                    }}
                  >
                    {plan.cta}
                  </a>

                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>

        {/* ── TRUST STRIP ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 mb-20">
          {["30-day money-back", "No hidden fees", "Cancel anytime", "SOC 2 Certified", "GDPR Compliant"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[11px] font-mono text-white/30">
              <span className="text-[#00E5A8]">✓</span> {t}
            </div>
          ))}
        </div>

      </div>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 mb-20 mt-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Full feature breakdown.</h2>
          <p className="text-[14px] text-white/35">Every detail, side by side.</p>
        </div>
        <PricingCompareTable />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* ── FAQ ── */}
        <div className="mb-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-white/10 bg-white/[0.02] text-white/50">
              FAQ
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Common questions.</h2>
          </div>
          <FAQAccordion />
        </div>

      </div>
    </SubpageLayout>
  );
}

/* ── Pricing Comparison Table ── */
const COMPARE_FEATURES = [
  { section: "Authentication", rows: [
    { label: "Monthly API verifications", starter: "1,000", pro: "100,000", enterprise: "Unlimited" },
    { label: "Face + liveness checks", starter: "✓", pro: "✓", enterprise: "✓" },
    { label: "Iris + fingerprint fusion", starter: "✓", pro: "✓", enterprise: "✓" },
    { label: "Multi-sensor hardware trust", starter: "—", pro: "✓", enterprise: "✓" },
    { label: "Custom model training", starter: "—", pro: "—", enterprise: "✓" },
  ]},
  { section: "Security", rows: [
    { label: "Zero-knowledge matching", starter: "✓", pro: "✓", enterprise: "✓" },
    { label: "Hardware enclave (TEE)", starter: "—", pro: "✓", enterprise: "✓" },
    { label: "On-premise HSM deployment", starter: "—", pro: "—", enterprise: "✓" },
    { label: "Audit log SIEM integration", starter: "—", pro: "—", enterprise: "✓" },
    { label: "Fraud & spoof real-time scoring", starter: "—", pro: "✓", enterprise: "✓" },
  ]},
  { section: "Platform", rows: [
    { label: "Active deployment projects", starter: "1", pro: "5", enterprise: "Unlimited" },
    { label: "Custom domain mapping", starter: "—", pro: "✓", enterprise: "✓" },
    { label: "Webhook event notifications", starter: "—", pro: "✓", enterprise: "✓" },
    { label: "Dedicated sovereign infra", starter: "—", pro: "—", enterprise: "✓" },
    { label: "Dedicated success managers", starter: "—", pro: "—", enterprise: "✓" },
  ]},
  { section: "Compliance", rows: [
    { label: "SLA uptime guarantee", starter: "99.9%", pro: "99.95%", enterprise: "99.99% custom" },
    { label: "SOC 2 Type II reports", starter: "—", pro: "—", enterprise: "✓" },
    { label: "GDPR / HIPAA compliance kit", starter: "—", pro: "✓", enterprise: "✓" },
    { label: "FIDO2 / WebAuthn", starter: "✓", pro: "✓", enterprise: "✓" },
  ]},
];

const COL_COLORS = { starter: "#00E5A8", pro: "#00C2FF", enterprise: "#a78bfa" };

function PricingCompareTable() {
  return (
    <div className="w-full space-y-4">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-8 py-5.5 border border-white/[0.05] bg-white/[0.01] rounded-[22px] items-center mb-6">
        <div className="col-span-6 text-left text-white/35 font-mono uppercase tracking-widest text-[10px] font-bold">Feature</div>
        {(["Starter", "Pro", "Enterprise"] as const).map((name) => (
          <div 
            key={name} 
            className="col-span-2 text-center font-black text-[14.5px] font-sans tracking-tight" 
            style={{ color: COL_COLORS[name.toLowerCase() as keyof typeof COL_COLORS] }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Body Blocks */}
      {COMPARE_FEATURES.map((section, sectionIdx) => (
        <div key={section.section} className="space-y-3">
          {/* Section Category Header */}
          <div className="w-full bg-gradient-to-r from-[#22d3ee]/10 via-[#22d3ee]/5 to-transparent border-l-2 border-[#22d3ee] px-6 py-4.5 text-[11px] font-mono tracking-[0.2em] text-[#22d3ee] uppercase font-bold rounded-r-xl mt-8 mb-4">
            {section.section}
          </div>

          {section.rows.map((row, i) => (
            <div 
              key={i} 
              className="grid grid-cols-12 gap-4 px-8 py-5.5 rounded-[22px] bg-[#09090b] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.01] transition-all duration-200 items-center shadow-lg"
            >
              <div className="col-span-6 text-left text-white/90 font-sans font-semibold text-[14.5px] tracking-tight">{row.label}</div>
              
              {/* Starter Cell */}
              <div className="col-span-2 flex justify-center">
                {row.starter === "✓" ? (
                  <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 text-[#00E5A8] shadow-[0_0_12px_rgba(0,229,168,0.25)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : row.starter === "—" ? (
                  <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
                ) : (
                  <span className="px-3.5 py-1 text-[13px] font-mono font-bold bg-[#00E5A8]/5 border border-[#00E5A8]/20 rounded-lg text-[#00E5A8]">{row.starter}</span>
                )}
              </div>

              {/* Pro Cell */}
              <div className="col-span-2 flex justify-center">
                {row.pro === "✓" ? (
                  <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-[#00C2FF]/10 border border-[#00C2FF]/30 text-[#00C2FF] shadow-[0_0_12px_rgba(0,194,255,0.25)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : row.pro === "—" ? (
                  <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
                ) : (
                  <span className="px-3.5 py-1 text-[13px] font-mono font-bold bg-[#00C2FF]/5 border border-[#00C2FF]/20 rounded-lg text-[#00C2FF]">{row.pro}</span>
                )}
              </div>

              {/* Enterprise Cell */}
              <div className="col-span-2 flex justify-center">
                {row.enterprise === "✓" ? (
                  <div className="inline-flex items-center justify-center w-6.5 h-6.5 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.25)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : row.enterprise === "—" ? (
                  <div className="w-2 h-2 rounded-full bg-white/[0.04]" />
                ) : (
                  <span className="px-3.5 py-1 text-[13px] font-mono font-bold bg-[#a78bfa]/5 border border-[#a78bfa]/20 rounded-lg text-[#a78bfa]">{row.enterprise}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── FAQ Accordion ── */
const FAQS = [
  { q: "How does NeoFace store biometric data?", a: "NeoFace never stores raw biometric data. We generate a one-way cryptographic hash from your biometric features and store only that hash — inside a hardware-backed secure enclave. The original biometric cannot be reconstructed." },
  { q: "What modalities are supported?", a: "Face ID, passive liveness detection, iris matching, fingerprint recognition, and behavioral anomaly scoring. All modalities can be fused together for higher assurance." },
  { q: "How does pricing scale after I hit my monthly limit?", a: "On Starter, API calls above 1,000 are queued until the next billing cycle. On Pro and Enterprise, we offer pay-as-you-go overage at transparent per-call rates with no surprise bills." },
  { q: "Can I use NeoFace alongside my existing auth provider?", a: "Yes. NeoFace is designed as a biometric layer on top of Auth0, Firebase, Clerk, Okta, or any OAuth-compatible system. You don't need to replace your existing auth infrastructure." },
  { q: "What's the average latency?", a: "87ms median end-to-end for a face + liveness verification on the Pro tier, measured globally across our edge network. Enterprise tier includes dedicated regional inference nodes for sub-50ms." },
  { q: "Is NeoFace compliant with GDPR and HIPAA?", a: "Yes. NeoFace is GDPR-compliant by design — we offer a Data Processing Agreement (DPA) and Data Subject Access Request (DSAR) tools. HIPAA compliance packages are available on Pro and Enterprise." },
  { q: "Can I self-host NeoFace on-premise?", a: "On-premise HSM deployment is available on the Enterprise plan. This includes dedicated hardware, sovereign infrastructure, and air-gapped deployment options for high-security environments." },
  { q: "What happens if a liveness check fails?", a: "Failed liveness checks return a structured error with a reason code (e.g., `SPOOF_DETECTED`, `LOW_CONFIDENCE`, `REPLAY_ATTACK`). You define the fallback flow in your application — NeoFace doesn't lock users out." },
  { q: "Do you offer a free trial for Pro?", a: "Yes. The Pro plan includes a 30-day free trial with full feature access and 100,000 API verifications. No credit card required to start. Downgrade anytime." },
  { q: "How is pricing handled for enterprise contracts?", a: "Enterprise contracts are annual and negotiated based on verification volume, SLA requirements, and deployment topology. Contact sales@neoface.io for a custom quote within 24 hours." },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-[14px]">
      {/* Column 1 */}
      <div className="space-y-4">
        {FAQS.filter((_, idx) => idx % 2 === 0).map((faq, index) => {
          const idx = index * 2;
          const active = open === idx;

          return (
            <div
              key={idx}
              className={`border border-white/[0.05] bg-neutral-950/20 rounded-[1.75rem] overflow-hidden transition-all duration-300 ${active ? "border-[#10b981]/40 bg-white/[0.02]" : "hover:border-white/10"
                }`}
            >
              <button
                onClick={() => setOpen(active ? null : idx)}
                className="w-full px-8 py-5.5 flex items-center justify-between text-left font-bold text-white transition-colors"
              >
                <span className="pr-4">{faq.q}</span>
                <span
                  className="text-white/30 text-lg flex-shrink-0 transition-transform duration-300"
                  style={{ transform: active ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
              {active && (
                <div className="px-8 pb-7 text-white/50 leading-relaxed border-t border-white/[0.03] pt-5 font-light font-sans text-[13.5px]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Column 2 */}
      <div className="space-y-4">
        {FAQS.filter((_, idx) => idx % 2 !== 0).map((faq, index) => {
          const idx = index * 2 + 1;
          const active = open === idx;

          return (
            <div
              key={idx}
              className={`border border-white/[0.05] bg-neutral-950/20 rounded-[1.75rem] overflow-hidden transition-all duration-300 ${active ? "border-[#10b981]/40 bg-white/[0.02]" : "hover:border-white/10"
                }`}
            >
              <button
                onClick={() => setOpen(active ? null : idx)}
                className="w-full px-8 py-5.5 flex items-center justify-between text-left font-bold text-white transition-colors"
              >
                <span className="pr-4">{faq.q}</span>
                <span
                  className="text-white/30 text-lg flex-shrink-0 transition-transform duration-300"
                  style={{ transform: active ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>
              {active && (
                <div className="px-8 pb-7 text-white/50 leading-relaxed border-t border-white/[0.03] pt-5 font-light font-sans text-[13.5px]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
