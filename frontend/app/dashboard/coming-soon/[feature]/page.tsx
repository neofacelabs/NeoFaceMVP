"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic, Eye, Hand, Brain, Smile, Lock, Wallet,
  Globe, Key, Shield, Building, Store, Zap, Network,
  Users, Map, CheckCircle2, Clock, ArrowRight, Bell,
} from "lucide-react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const FEATURES: Record<string, {
  label: string;
  icon: any;
  color: string;
  tagline: string;
  desc: string;
  benefits: string[];
  roadmap: { phase: string; label: string; status: "done" | "in-progress" | "planned" }[];
  eta: string;
}> = {
  "voice-auth": {
    label: "Voice Authentication",
    icon: Mic,
    color: "#00E5A8",
    tagline: "Authenticate with the sound of your voice.",
    desc: "NeoFace Voice Authentication uses a neural speaker verification model to create a unique voiceprint for each user. Authenticate in under 2 seconds with passive anti-spoofing that detects recorded playbacks and TTS synthesis.",
    benefits: [
      "Hands-free authentication for accessibility",
      "Works over phone and VoIP",
      "Real-time synthetic voice detection",
      "Multi-language support (40+ languages)",
      "Voiceprint stored as irreversible embeddings",
    ],
    roadmap: [
      { phase: "Q2 2026", label: "Voiceprint enrollment API", status: "done" },
      { phase: "Q3 2026", label: "Passive anti-spoofing", status: "in-progress" },
      { phase: "Q3 2026", label: "Real-time verification", status: "planned" },
      { phase: "Q4 2026", label: "SDK & production launch", status: "planned" },
    ],
    eta: "Q4 2026",
  },
  "iris-recognition": {
    label: "Iris Recognition",
    icon: Eye,
    color: "#00C2FF",
    tagline: "The most accurate biometric modality available.",
    desc: "Iris patterns are unique even between identical twins and remain stable across a lifetime. NeoFace Iris Recognition uses near-infrared imaging analysis to deliver 1-in-1.2-million false accept rates — the gold standard for high-security access control.",
    benefits: [
      "1-in-1.2M false accept rate",
      "Contactless — works from 30-60cm",
      "Liveness detection built-in",
      "Stable across lifetime (unlike fingerprints)",
      "Works with glasses and contact lenses",
    ],
    roadmap: [
      { phase: "Q3 2026", label: "NIR image analysis model", status: "in-progress" },
      { phase: "Q4 2026", label: "Mobile SDK integration", status: "planned" },
      { phase: "Q1 2027", label: "Production API launch", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "palm-recognition": {
    label: "Palm Recognition",
    icon: Hand,
    color: "#818cf8",
    tagline: "Contactless palm vein authentication.",
    desc: "Palm vein authentication uses near-infrared imaging to map the unique vascular pattern beneath the skin. Unlike fingerprints, vein patterns cannot be lifted from surfaces, making palm recognition exceptionally spoof-resistant.",
    benefits: [
      "Cannot be spoofed with lifted prints",
      "Contactless — no surface contact",
      "Works with dirty or wet hands",
      "Vascular patterns are internal — very hard to fake",
      "Ideal for healthcare and food service",
    ],
    roadmap: [
      { phase: "Q4 2026", label: "Palm vein model research", status: "planned" },
      { phase: "Q1 2027", label: "Prototype API", status: "planned" },
      { phase: "Q2 2027", label: "Production launch", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "behavioral-biometrics": {
    label: "Behavioral Biometrics",
    icon: Brain,
    color: "#fbbf24",
    tagline: "Authenticate by how you interact, not just who you are.",
    desc: "NeoFace Behavioral Biometrics builds a continuous authentication model from typing cadence, mouse movement patterns, scroll behavior, and touch pressure. Silently monitors sessions and triggers step-up auth when risk spikes.",
    benefits: [
      "Zero-friction continuous authentication",
      "Detects account takeover in real-time",
      "No user action required",
      "Works across web and mobile",
      "Complements biometric modalities",
    ],
    roadmap: [
      { phase: "Q3 2026", label: "Typing pattern model", status: "in-progress" },
      { phase: "Q4 2026", label: "Mouse & scroll patterns", status: "planned" },
      { phase: "Q4 2026", label: "Risk integration", status: "planned" },
      { phase: "Q1 2027", label: "Production launch", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "emotion-recognition": {
    label: "Emotion Recognition",
    icon: Smile,
    color: "#00E5A8",
    tagline: "Detect emotion and stress during authentication.",
    desc: "Optional emotion analysis during face authentication can detect coercion, stress, or confusion — providing an additional safety signal for high-stakes transactions. Fully opt-in and consent-based.",
    benefits: [
      "Detect coerced authentication",
      "Consent-based — always opt-in",
      "7 emotion categories",
      "Integrates with risk engine",
      "Privacy-preserving (no emotion stored)",
    ],
    roadmap: [
      { phase: "Q4 2026", label: "Emotion model integration", status: "planned" },
      { phase: "Q1 2027", label: "Risk engine integration", status: "planned" },
      { phase: "Q1 2027", label: "Production launch", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "continuous-auth": {
    label: "Continuous Authentication",
    icon: Lock,
    color: "#818cf8",
    tagline: "Verify identity throughout the session, not just at login.",
    desc: "Continuous Authentication combines behavioral biometrics, face re-verification challenges, and session risk scoring to maintain a confidence score throughout a user session. Step-up challenges are triggered when the score drops below a configurable threshold.",
    benefits: [
      "Prevents session hijacking after login",
      "Configurable confidence thresholds",
      "Non-intrusive for normal users",
      "Works alongside behavioral biometrics",
      "Webhooks for risk events",
    ],
    roadmap: [
      { phase: "Q3 2026", label: "Session scoring engine", status: "in-progress" },
      { phase: "Q4 2026", label: "Step-up challenge flows", status: "planned" },
      { phase: "Q1 2027", label: "SDK & webhooks", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "identity-wallet": {
    label: "Identity Wallet",
    icon: Wallet,
    color: "#00C2FF",
    tagline: "User-controlled portable biometric identity.",
    desc: "The NeoFace Identity Wallet lets users carry a cryptographically signed biometric credential that they can present to any NeoFace-integrated application without re-enrolling. Powered by W3C Verifiable Credentials and DID standards.",
    benefits: [
      "Enroll once, authenticate everywhere",
      "User controls their own biometric data",
      "W3C Verifiable Credentials standard",
      "Offline-capable authentication",
      "Zero-knowledge proof support",
    ],
    roadmap: [
      { phase: "Q1 2027", label: "DID infrastructure", status: "planned" },
      { phase: "Q1 2027", label: "Wallet SDK", status: "planned" },
      { phase: "Q2 2027", label: "Cross-app identity sharing", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "enterprise-sso": {
    label: "Enterprise SSO",
    icon: Globe,
    color: "#818cf8",
    tagline: "SAML & OIDC federation with biometric MFA.",
    desc: "Replace or augment your existing SSO provider with biometric MFA. NeoFace Enterprise SSO acts as a SAML 2.0 and OIDC provider, adding face or fingerprint as a second factor to your existing identity flows.",
    benefits: [
      "Drop-in SAML 2.0 and OIDC support",
      "Works with Okta, Azure AD, Ping Identity",
      "Biometric MFA replaces SMS/TOTP",
      "Just-in-time provisioning",
      "Audit logs for compliance",
    ],
    roadmap: [
      { phase: "Q4 2026", label: "OIDC provider", status: "planned" },
      { phase: "Q1 2027", label: "SAML 2.0 SP/IdP", status: "planned" },
      { phase: "Q1 2027", label: "Okta & Azure AD connectors", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "passkeys-plus": {
    label: "Passkeys+",
    icon: Key,
    color: "#00E5A8",
    tagline: "WebAuthn passkeys enhanced with biometric verification.",
    desc: "Passkeys+ extends the WebAuthn standard by binding FIDO2 passkeys to biometric identity enrollment. Every passkey authentication is cross-referenced with the enrolled biometric to prevent passkey theft and account sharing.",
    benefits: [
      "Phishing-resistant by design",
      "Bound to biometric identity",
      "No password required",
      "Cross-platform (iOS, Android, Web)",
      "Liveness check on high-risk requests",
    ],
    roadmap: [
      { phase: "Q4 2026", label: "Passkey-biometric binding", status: "planned" },
      { phase: "Q1 2027", label: "Cross-platform SDK", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "adaptive-mfa": {
    label: "Adaptive MFA",
    icon: Shield,
    color: "#fbbf24",
    tagline: "Context-aware step-up authentication.",
    desc: "Adaptive MFA dynamically adjusts the authentication requirement based on real-time risk signals. Low-risk logins get a frictionless experience while high-risk events trigger biometric step-up challenges automatically.",
    benefits: [
      "Risk-based authentication",
      "No friction for trusted scenarios",
      "Automatic step-up for risky events",
      "Configurable risk thresholds",
      "Works with all NeoFace modalities",
    ],
    roadmap: [
      { phase: "Q3 2026", label: "Risk signal aggregation", status: "in-progress" },
      { phase: "Q4 2026", label: "Step-up policy engine", status: "planned" },
      { phase: "Q1 2027", label: "Production launch", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "compliance-center": {
    label: "Compliance Center",
    icon: Building,
    color: "#00C2FF",
    tagline: "SOC 2, GDPR, HIPAA — covered.",
    desc: "The Compliance Center provides automated compliance reporting, audit trail exports, data residency controls, and policy enforcement tooling for regulated industries.",
    benefits: [
      "SOC 2 Type II reports on demand",
      "GDPR data subject request automation",
      "HIPAA-ready infrastructure",
      "SIEM export (Splunk, Datadog)",
      "Policy-as-code enforcement",
    ],
    roadmap: [
      { phase: "Q4 2026", label: "Audit log export API", status: "planned" },
      { phase: "Q1 2027", label: "GDPR automation", status: "planned" },
      { phase: "Q1 2027", label: "Compliance dashboard", status: "planned" },
    ],
    eta: "Q1 2027",
  },
  "marketplace": {
    label: "Marketplace",
    icon: Store,
    color: "#818cf8",
    tagline: "Integrations, plugins, and identity apps.",
    desc: "The NeoFace Marketplace will feature first and third-party integrations, custom model plugins, and certified identity applications built on the NeoFace platform.",
    benefits: [
      "One-click integrations",
      "Certified app ecosystem",
      "Revenue sharing for publishers",
      "Pluggable model registry",
      "No-code workflow builder",
    ],
    roadmap: [
      { phase: "Q1 2027", label: "Developer marketplace", status: "planned" },
      { phase: "Q2 2027", label: "Integration directory", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "billing": {
    label: "Billing",
    icon: Wallet,
    color: "#00E5A8",
    tagline: "Usage-based billing and invoicing.",
    desc: "Stripe-powered usage-based billing with real-time usage dashboards, invoice management, and team-level cost allocation. Currently in development.",
    benefits: [
      "Usage-based pricing",
      "Real-time usage dashboard",
      "Team cost allocation",
      "Automatic overage notifications",
      "Invoice download and history",
    ],
    roadmap: [
      { phase: "Q3 2026", label: "Stripe integration", status: "in-progress" },
      { phase: "Q3 2026", label: "Usage metering", status: "planned" },
      { phase: "Q4 2026", label: "Billing dashboard launch", status: "planned" },
    ],
    eta: "Q4 2026",
  },
  "edge-auth": {
    label: "Edge Authentication",
    icon: Zap,
    color: "#00C2FF",
    tagline: "Sub-10ms biometric auth from the edge.",
    desc: "NeoFace Edge Authentication deploys lightweight ONNX models to Cloudflare Workers and AWS Lambda@Edge, enabling biometric decisions at the network edge with sub-10ms latency.",
    benefits: [
      "Sub-10ms face verification",
      "No cold starts",
      "Global edge network (200+ PoPs)",
      "Works offline with cached embeddings",
      "WASM-compatible ONNX runtime",
    ],
    roadmap: [
      { phase: "Q1 2027", label: "ONNX WASM runtime", status: "planned" },
      { phase: "Q1 2027", label: "Cloudflare Workers integration", status: "planned" },
      { phase: "Q2 2027", label: "Global edge rollout", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "federation": {
    label: "Federation",
    icon: Network,
    color: "#818cf8",
    tagline: "Federated identity across organizational boundaries.",
    desc: "NeoFace Federation enables cross-organization identity sharing. A user enrolled with Organization A can authenticate with Organization B without re-enrollment, using cryptographic trust chains.",
    benefits: [
      "Cross-org biometric trust chains",
      "Privacy-preserving federation",
      "No biometric data sharing",
      "Governance controls per federation",
      "Works with identity wallets",
    ],
    roadmap: [
      { phase: "Q2 2027", label: "Trust chain protocol", status: "planned" },
      { phase: "Q2 2027", label: "Federation dashboard", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "access-governance": {
    label: "Access Governance",
    icon: Users,
    color: "#fbbf24",
    tagline: "Fine-grained biometric access policies.",
    desc: "Define who can authenticate, when, from where, and with what modality. Access Governance provides a policy engine with time-based rules, geo-fencing, device restrictions, and role-based access controls.",
    benefits: [
      "Time-based access policies",
      "Geo-fencing (country/region/IP)",
      "Device allowlisting",
      "Role-based modality requirements",
      "Policy audit trail",
    ],
    roadmap: [
      { phase: "Q1 2027", label: "Policy engine", status: "planned" },
      { phase: "Q2 2027", label: "Governance dashboard", status: "planned" },
    ],
    eta: "Q2 2027",
  },
  "identity-graph": {
    label: "Identity Graph",
    icon: Map,
    color: "#00C2FF",
    tagline: "Understand identity relationships at scale.",
    desc: "The Identity Graph visualizes relationships between users, devices, locations, and authentication events. Detect fraud rings, account sharing, and identity clusters across your user base.",
    benefits: [
      "Visual graph exploration",
      "Fraud ring detection",
      "Account sharing detection",
      "Device lineage tracking",
      "Graph query API",
    ],
    roadmap: [
      { phase: "Q2 2027", label: "Graph database integration", status: "planned" },
      { phase: "Q2 2027", label: "Visualization UI", status: "planned" },
    ],
    eta: "Q2 2027",
  },
};

export default function ComingSoonPage({ params }: { params: { feature: string } }) {
  const feature = FEATURES[params.feature];
  if (!feature) notFound();

  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleWaitlist = async () => {
    if (!email.trim() || !email.includes("@")) { toast.error("Please enter a valid email"); return; }
    try {
      await apiClient.post("waitlist", { email, feature: params.feature });
      setJoined(true);
      toast.success(`You're on the waitlist for ${feature.label}!`);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to join waitlist";
      toast.error(msg);
    }
  };

  const statusColors = {
    done: "#00E5A8",
    "in-progress": "#00C2FF",
    planned: "rgba(255,255,255,0.2)",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}>
          <feature.icon size={28} style={{ color: feature.color }} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-5"
          style={{ background: `${feature.color}08`, border: `1px solid ${feature.color}18`, color: feature.color }}>
          <Clock size={10} /> Coming {feature.eta}
        </div>

        <h1 className="text-[32px] md:text-[40px] font-bold text-white tracking-tight mb-3">{feature.label}</h1>
        <p className="text-[16px] font-medium mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>{feature.tagline}</p>
        <p className="text-[14px] leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.38)" }}>
          {feature.desc}
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="dash-card rounded-2xl p-7">
        <p className="text-[13px] font-semibold text-white mb-5">What you'll get</p>
        <div className="grid md:grid-cols-2 gap-3">
          {feature.benefits.map(b => (
            <div key={b} className="flex items-start gap-2.5">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: feature.color }} />
              <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>{b}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Roadmap */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="dash-card rounded-2xl p-7">
        <p className="text-[13px] font-semibold text-white mb-6">Roadmap</p>
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="space-y-5">
            {feature.roadmap.map((r, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center z-10"
                  style={{
                    background: r.status === "done" ? feature.color : r.status === "in-progress" ? `${feature.color}30` : "rgba(255,255,255,0.06)",
                    border: r.status !== "done" ? `1px solid ${r.status === "in-progress" ? feature.color : "rgba(255,255,255,0.1)"}` : "none",
                  }}>
                  {r.status === "done" && <CheckCircle2 size={10} style={{ color: "#000" }} />}
                  {r.status === "in-progress" && <div className="w-1.5 h-1.5 rounded-full" style={{ background: feature.color }} />}
                </div>
                <div className="flex-1">
                  <span className="text-[13px] font-medium" style={{ color: r.status === "planned" ? "rgba(255,255,255,0.38)" : "#fff" }}>
                    {r.label}
                  </span>
                </div>
                <span className="text-[10.5px] font-mono shrink-0"
                  style={{ color: r.status === "done" ? feature.color : "rgba(255,255,255,0.25)" }}>
                  {r.phase}
                </span>
                {r.status === "in-progress" && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}25` }}>
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Waitlist */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: `linear-gradient(135deg, ${feature.color}06, rgba(255,255,255,0.02))`, border: `1px solid ${feature.color}15` }}>
        {joined ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: `${feature.color}12`, border: `1px solid ${feature.color}20` }}>
              <CheckCircle2 size={20} style={{ color: feature.color }} />
            </div>
            <p className="text-[15px] font-semibold text-white">You're on the waitlist!</p>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              We'll notify you when {feature.label} is available.
            </p>
          </div>
        ) : (
          <>
            <Bell size={20} className="mx-auto mb-3" style={{ color: feature.color }} />
            <p className="text-[15px] font-semibold text-white mb-1">Get early access</p>
            <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Join the waitlist and be the first to know when {feature.label} launches.
            </p>
            <div className="flex items-center gap-3 max-w-sm mx-auto">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@company.com"
                type="email"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-[13px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onKeyDown={e => e.key === "Enter" && handleWaitlist()}
              />
              <button onClick={handleWaitlist}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold shrink-0"
                style={{ background: feature.color, color: "#000" }}>
                Join <ArrowRight size={13} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
