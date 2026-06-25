"use client";
import { Fragment, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Pricing Tiers ─────────────────────────────────────────────────────── */
const TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For developers exploring the API and building prototypes.",
    verifications: "1,000 / mo",
    color: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.08)",
    accentColor: "#fff",
    badge: null,
    cta: "Start for Free",
    ctaStyle: "ghost",
    features: [
      "Face authentication",
      "Fingerprint authentication (WebAuthn)",
      "REST API access",
      "Liveness detection",
      "Community support",
      "99.9% uptime SLA",
    ],
    notIncluded: [
      "Trust Engine & risk scoring",
      "Webhooks & events",
      "Custom domains",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$149",
    period: "per month",
    description: "For growing teams shipping production identity infrastructure.",
    verifications: "100,000 / mo",
    color: "rgba(0,229,168,0.06)",
    borderColor: "rgba(0,229,168,0.35)",
    accentColor: "#00E5A8",
    badge: "Most Popular",
    cta: "Start Pro Trial",
    ctaStyle: "primary",
    features: [
      "All Starter features",
      "Trust Engine & risk scoring",
      "Device fingerprinting",
      "5 projects",
      "Webhooks",
      "Analytics & logs",
      "Priority support",
      "Custom domains",
      "99.95% uptime SLA",
    ],
    notIncluded: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "For organizations requiring enterprise-grade identity infrastructure at scale.",
    verifications: "Unlimited",
    color: "rgba(0,194,255,0.04)",
    borderColor: "rgba(0,194,255,0.2)",
    accentColor: "#00C2FF",
    badge: null,
    cta: "Contact Sales",
    ctaStyle: "blue",
    features: [
      "All Pro features",
      "Dedicated infrastructure",
      "SSO & SAML (coming soon)",
      "Custom SLA (99.99% SLA)",
      "Dedicated success manager",
      "SOC 2 Type II reports",
      "Audit logs (SIEM export)",
      "Custom model fine-tuning",
      "On-premises deployment",
    ],
    notIncluded: [],
  },
];

/* ─── Feature comparison rows ───────────────────────────────────────────── */
const FEATURE_TABLE = [
  {
    category: "Authentication",
    rows: [
      { feature: "Face authentication", starter: true, pro: true, enterprise: true },
      { feature: "Fingerprint authentication", starter: true, pro: true, enterprise: true },
      { feature: "Iris authentication", starter: false, pro: false, enterprise: true },
      { feature: "Liveness detection", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
      { feature: "Anti-spoofing", starter: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Security",
    rows: [
      { feature: "Risk scoring engine", starter: false, pro: "Advanced", enterprise: "Custom AI" },
      { feature: "Anomaly detection", starter: false, pro: true, enterprise: true },
      { feature: "SOC 2 Type II", starter: false, pro: true, enterprise: true },
      { feature: "GDPR DPA", starter: false, pro: true, enterprise: true },
      { feature: "HIPAA compliance", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Developer",
    rows: [
      { feature: "REST API", starter: true, pro: true, enterprise: true },
      { feature: "GraphQL API", starter: false, pro: true, enterprise: true },
      { feature: "iOS & Android SDKs", starter: true, pro: true, enterprise: true },
      { feature: "Web SDK", starter: true, pro: true, enterprise: true },
      { feature: "Webhooks & events", starter: false, pro: true, enterprise: true },
      { feature: "SSO / SAML", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Platform",
    rows: [
      { feature: "Monthly verifications", starter: "1,000", pro: "100,000", enterprise: "Unlimited" },
      { feature: "Analytics dashboard", starter: false, pro: true, enterprise: true },
      { feature: "Custom branding", starter: false, pro: true, enterprise: true },
      { feature: "On-premises option", starter: false, pro: false, enterprise: true },
      { feature: "Dedicated infra", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { feature: "Community support", starter: true, pro: true, enterprise: true },
      { feature: "Email support", starter: false, pro: "12h SLA", enterprise: "4h SLA" },
      { feature: "Slack / Teams channel", starter: false, pro: true, enterprise: true },
      { feature: "24/7 dedicated support", starter: false, pro: false, enterprise: true },
    ],
  },
];

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
const FAQ = [
  {
    q: "What counts as a verification?",
    a: "Each time a user's biometric is checked against our API — whether face, iris, or fingerprint — that counts as one verification. Enrollment calls do not count toward your monthly quota.",
  },
  {
    q: "What happens if I exceed my monthly quota?",
    a: "We charge $0.003 per additional verification above your plan's quota. We'll notify you when you reach 80% of your limit so you can upgrade before overage kicks in.",
  },
  {
    q: "Can I try the API before paying?",
    a: "Absolutely. Our Starter plan gives you 1,000 verifications per month, forever. No credit card required to get started. Just sign up and grab your API key.",
  },
  {
    q: "Is biometric data stored on your servers?",
    a: "No raw biometric data is ever stored. We convert biometrics into encrypted mathematical templates at the edge. Actual images or scans are never retained. You can also opt for on-premises deployment on the Enterprise plan for full data sovereignty.",
  },
  {
    q: "Do you support on-premises deployment?",
    a: "Yes, on-premises and private cloud deployment is available on the Enterprise plan. Contact our sales team to discuss infrastructure requirements.",
  },
  {
    q: "Which compliance certifications do you hold?",
    a: "NeoFace is SOC 2 Type II certified, GDPR-ready with Data Processing Agreements available, and HIPAA compliance support is available on Enterprise plans. ISO 27001 certification is in progress.",
  },
];

/* ─── Check / X icons ────────────────────────────────────────────────────── */
function CheckIcon({ color = "#00E5A8" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke={color} strokeOpacity="0.3" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" stroke="rgba(255,255,255,0.1)" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CellValue({ value, accentColor = "#00E5A8" }: { value: boolean | string; accentColor?: string }) {
  if (value === true) return <CheckIcon color={accentColor} />;
  if (value === false) return <XIcon />;
  return <span className="text-[11px] font-mono font-semibold" style={{ color: accentColor }}>{value}</span>;
}

/* ─── Tier Card ──────────────────────────────────────────────────────────── */
function TierCard({ tier, index }: { tier: any; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const isPrimary = tier.ctaStyle === "primary";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        background: tier.color,
        border: `1px solid ${tier.borderColor}`,
        boxShadow: isPrimary
          ? `0 0 60px rgba(0,229,168,0.08), 0 24px 48px rgba(0,0,0,0.4)`
          : `0 8px 32px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Popular badge */}
      {tier.badge && (
        <div
          className="absolute top-0 inset-x-0 flex justify-center"
        >
          <div
            className="text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-b-lg"
            style={{ background: tier.accentColor, color: "#000" }}
          >
            {tier.badge}
          </div>
        </div>
      )}

      <div className={`flex flex-col flex-1 p-7 ${tier.badge ? "pt-10" : ""}`}>
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3"
            style={{ color: tier.accentColor }}
          >
            {tier.name}
          </div>
          <div className="flex items-end gap-1.5 mb-2">
            <span
              className="font-bold leading-none"
              style={{ fontSize: tier.price === "Custom" ? "2rem" : "2.75rem", color: "#fff" }}
            >
              {tier.price}
            </span>
            {tier.price !== "Custom" && (
              <span className="text-[13px] text-white/30 mb-1.5 font-mono">/{tier.period}</span>
            )}
          </div>
          <p className="text-[13px] text-white/40 leading-[1.6]">{tier.description}</p>
        </div>

        {/* Verifications */}
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-6"
          style={{ background: `${tier.accentColor}0d`, border: `1px solid ${tier.accentColor}1a` }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.5 3.5L12 5.5l-2.5 2.5.6 3.5L7 9.8 3.9 11.5l.6-3.5L2 5.5l3.5-1L7 1z" stroke={tier.accentColor} strokeWidth="0.9" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] font-mono font-semibold" style={{ color: tier.accentColor }}>
            {tier.verifications}
          </span>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 flex-1 mb-7">
          {tier.features.map((f: string) => (
            <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/65">
              <CheckIcon color={tier.accentColor} />
              <span>{f}</span>
            </li>
          ))}
          {tier.notIncluded.map((f: string) => (
            <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/20 line-through">
              <XIcon />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href={tier.id === "enterprise" ? "mailto:sales@neoface.io" : "/register"}>
          <motion.button
            whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-[13.5px] font-semibold transition-all"
            style={
              tier.ctaStyle === "primary"
                ? { background: "#00E5A8", color: "#000" }
                : tier.ctaStyle === "accent"
                ? { background: "rgba(0,229,168,0.12)", color: "#00E5A8", border: "1px solid rgba(0,229,168,0.25)" }
                : tier.ctaStyle === "blue"
                ? { background: "rgba(0,194,255,0.1)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.25)" }
                : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            {tier.cta}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Feature Table ──────────────────────────────────────────────────────── */
function FeatureTable() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr>
            <th className="text-left py-4 pr-6 text-[12px] text-white/30 font-medium uppercase tracking-widest w-[40%]">
              Features
            </th>
            {["Starter", "Pro", "Enterprise"].map((t, i) => (
              <th key={t} className="text-center py-4 px-3 text-[12px] font-semibold" style={{
                color: t === "Pro" ? "#00E5A8" : t === "Enterprise" ? "#00C2FF" : "rgba(255,255,255,0.5)"
              }}>
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_TABLE.map((section, si) => (
            <Fragment key={section.category}>
              <tr>
                <td
                  colSpan={4}
                  className="py-3 pt-7 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25"
                >
                  {section.category}
                </td>
              </tr>
              {section.rows.map((row, ri) => (
                <tr
                  key={row.feature}
                  className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 pr-6 text-[13px] text-white/55">{row.feature}</td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex justify-center">
                      <CellValue value={(row as any).starter} accentColor="rgba(255,255,255,0.6)" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center bg-[rgba(0,229,168,0.02)]">
                    <div className="flex justify-center">
                      <CellValue value={(row as any).pro} accentColor="#00E5A8" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex justify-center">
                      <CellValue value={(row as any).enterprise} accentColor="#00C2FF" />
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

/* ─── FAQ Accordion ──────────────────────────────────────────────────────── */
function FAQItem({ item, index }: { item: typeof FAQ[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/[0.06]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] text-white/75 font-medium group-hover:text-white transition-colors pr-6">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center"
          style={{ color: open ? "#00E5A8" : "rgba(255,255,255,0.4)", borderColor: open ? "rgba(0,229,168,0.4)" : "rgba(255,255,255,0.12)" }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[14px] text-white/45 leading-[1.75] pb-5">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Pricing Page Component ────────────────────────────────────────── */
export function PricingPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <main className="relative bg-black min-h-screen">
      {/* ── Atmosphere ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,229,168,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 80% 60%, rgba(0,194,255,0.03) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-32">

        {/* ── Hero ── */}
        <div ref={heroRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00E5A8]/20 bg-[#00E5A8]/[0.06] text-[#00E5A8] text-[11px] font-semibold tracking-wide mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
            Simple, transparent pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold text-white tracking-[-0.035em] leading-[1.08] mb-6"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Start free.{" "}
            <span style={{ color: "#00E5A8" }}>Scale as you grow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-[17px] text-white/40 max-w-xl mx-auto leading-[1.7]"
          >
            No credit card required. 1,000 verifications free every month.
            Upgrade when you need more power.
          </motion.p>

          {/* Overage note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 text-[12px] text-white/25 font-mono"
          >
            <span className="w-1 h-1 rounded-full bg-white/20" />
            $0.003 per verification over quota
            <span className="w-1 h-1 rounded-full bg-white/20" />
            Cancel anytime
          </motion.div>
        </div>

        {/* ── Tier Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}
        </div>

        {/* ── Feature Table ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-[11px] font-semibold tracking-wide mb-5">
              Full comparison
            </div>
            <h2
              className="font-bold text-white tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              Everything you get
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden p-1"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="p-6 lg:p-10">
              <FeatureTable />
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-[11px] font-semibold tracking-wide mb-5">
              Common questions
            </div>
            <h2
              className="font-bold text-white tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)" }}
            >
              Got questions?
            </h2>
          </div>

          <div>
            {FAQ.map((item, i) => (
              <FAQItem key={item.q} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div
          className="relative rounded-3xl overflow-hidden text-center p-16"
          style={{
            background: "rgba(0,229,168,0.04)",
            border: "1px solid rgba(0,229,168,0.12)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,229,168,0.08) 0%, transparent 65%)",
            }}
          />
          <div className="relative">
            <div className="text-[11px] font-semibold text-[#00E5A8] tracking-widest uppercase mb-4">
              Ready to get started?
            </div>
            <h2
              className="font-bold text-white tracking-[-0.03em] mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Build biometric auth today.
            </h2>
            <p className="text-[16px] text-white/40 mb-10 max-w-md mx-auto leading-[1.7]">
              No credit card. No setup fee. Just your API key and you&apos;re live in minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(0,229,168,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-full bg-[#00E5A8] text-black font-semibold text-[14px] flex items-center gap-2"
                >
                  Get Your API Key
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 6h9M7 2.5L10.5 6 7 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </Link>
              <Link href="mailto:sales@neoface.io">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 rounded-full border border-white/10 bg-white/[0.04] text-white font-medium text-[14px] backdrop-blur-md"
                >
                  Talk to Sales
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
