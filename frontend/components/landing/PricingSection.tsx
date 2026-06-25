"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap, Building2, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    icon: Zap,
    monthly: 0,
    annual: 0,
    desc: "For developers building their first identity-aware app.",
    color: "#00E5A8",
    cta: "Start Free",
    href: "/register",
    highlight: false,
    features: [
      "1,000 API calls / month",
      "Face authentication",
      "Liveness detection",
      "WebAuthn / Passkeys",
      "1 project",
      "Community support",
      "Dashboard access",
      "99.9% SLA",
    ],
    limits: ["No custom domains", "Rate limited at 10 req/s"],
  },
  {
    name: "Pro",
    icon: Sparkles,
    monthly: 149,
    annual: 119,
    desc: "For growing teams shipping production identity infrastructure.",
    color: "#00C2FF",
    cta: "Start Pro Trial",
    href: "/register?plan=pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "100,000 API calls / month",
      "Everything in Starter",
      "Trust Engine",
      "Risk scoring",
      "Device fingerprinting",
      "5 projects",
      "Webhooks",
      "Analytics & logs",
      "Priority support",
      "Custom domains",
      "99.95% SLA",
    ],
    limits: [],
  },
  {
    name: "Enterprise",
    icon: Building2,
    monthly: null,
    annual: null,
    desc: "For organizations requiring enterprise-grade identity infrastructure at scale.",
    color: "#818cf8",
    cta: "Contact Sales",
    href: "mailto:sales@neoface.io",
    highlight: false,
    features: [
      "Unlimited API calls",
      "Everything in Pro",
      "Dedicated infrastructure",
      "SSO & SAML (coming soon)",
      "Custom SLA",
      "SoC 2 Type II reports",
      "Audit logs (SIEM export)",
      "Dedicated success manager",
      "Custom model fine-tuning",
      "On-premise deployment",
      "99.99% SLA",
    ],
    limits: [],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden bg-black">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #00C2FF, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-6"
            style={{ background: "rgba(0,194,255,0.06)", border: "1px solid rgba(0,194,255,0.15)", color: "#00C2FF" }}>
            Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Simple, predictable pricing
          </h2>
          <p className="text-[rgba(255,255,255,0.45)] text-lg max-w-xl mx-auto">
            Start free. Scale with confidence. No surprise bills.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="text-[13px]" style={{ color: !annual ? "#fff" : "rgba(255,255,255,0.35)" }}>Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className="relative w-11 h-6 rounded-full transition-colors duration-300"
              style={{ background: annual ? "#00C2FF" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300"
                style={{ transform: annual ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
            <span className="text-[13px]" style={{ color: annual ? "#fff" : "rgba(255,255,255,0.35)" }}>
              Annual <span className="text-[#00E5A8] ml-1 text-[11px] font-semibold">Save 20%</span>
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col rounded-2xl p-7 overflow-hidden"
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, rgba(0,194,255,0.08), rgba(0,229,168,0.04))"
                  : "rgba(255,255,255,0.025)",
                border: plan.highlight
                  ? "1px solid rgba(0,194,255,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
                boxShadow: plan.highlight ? "0 0 60px rgba(0,194,255,0.08)" : "none",
              }}
            >
              {/* Top shine */}
              {plan.highlight && (
                <div className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(0,194,255,0.5), transparent)" }} />
              )}

              {plan.badge && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{ background: "rgba(0,194,255,0.15)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.25)" }}>
                  {plan.badge}
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.color}10`, border: `1px solid ${plan.color}20` }}>
                  <plan.icon size={16} style={{ color: plan.color }} />
                </div>
                <span className="text-[15px] font-semibold text-white">{plan.name}</span>
              </div>

              {/* Price */}
              <div className="mb-3">
                {plan.monthly === null ? (
                  <div>
                    <p className="text-4xl font-bold text-white tracking-tight">Custom</p>
                    <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Talk to our team</p>
                  </div>
                ) : plan.monthly === 0 ? (
                  <div>
                    <p className="text-4xl font-bold text-white tracking-tight">Free</p>
                    <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Forever, no CC required</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-1">
                      <p className="text-4xl font-bold text-white tracking-tight">
                        ${annual ? plan.annual : plan.monthly}
                      </p>
                      <p className="text-[13px] pb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>/mo</p>
                    </div>
                    {annual && (
                      <p className="text-[11px] mt-0.5" style={{ color: "#00E5A8" }}>
                        Billed ${(plan.annual! * 12).toLocaleString()}/year
                      </p>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[12.5px] mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                {plan.desc}
              </p>

              {/* CTA */}
              <Link
                href={plan.href}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold mb-7 transition-all"
                style={{
                  background: plan.highlight ? `${plan.color}` : "rgba(255,255,255,0.06)",
                  color: plan.highlight ? "#000" : plan.color,
                  border: plan.highlight ? "none" : `1px solid ${plan.color}25`,
                }}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div className="space-y-2.5 flex-1">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                    <span className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[12px] mt-10"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          All plans include 99.9% SLA, GDPR-compliant infrastructure, and end-to-end encryption. 
          Need a custom contract?{" "}
          <a href="mailto:sales@neoface.io" className="underline" style={{ color: "rgba(255,255,255,0.45)" }}>
            Contact our sales team.
          </a>
        </motion.p>
      </div>
    </section>
  );
}
