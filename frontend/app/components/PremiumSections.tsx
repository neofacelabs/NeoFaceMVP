import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { BorderGlow } from "./ui/BorderGlow";
import { Quote, ShieldAlert, ShieldCheck, Fingerprint } from "lucide-react";



/* ─────────────────────────────────────────────
   1. SOCIAL PROOF — LOGO TICKER
───────────────────────────────────────────── */
const LOGOS = [
  "Razorpay", "PhonePe", "HDFC Bank", "Juspay", "PayU",
  "Zepto", "Blinkit", "Stripe", "Twilio", "Onfido",
  "Truecaller", "Paytm", "Plaid", "Checkr", "Okta",
];

export function LogoBar() {
  return (
    <section className="relative py-8 border-y border-white/[0.04] overflow-hidden bg-black">
      <div className="text-center mb-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25">
          Trusted by security teams at
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        <div
          className="flex gap-10 items-center"
          style={{ animation: "marquee 30s linear infinite", width: "max-content" }}
        >
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-[13px] font-semibold tracking-tight text-white/20 hover:text-white/55 transition-colors duration-300 cursor-default px-1"
              style={{ fontFamily: "'Fellix', 'Helvetica Neue', sans-serif" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. DEVELOPER API PREVIEW
───────────────────────────────────────────── */
const CODE_TABS: Record<string, string> = {
  "Node.js": `import { NeoFace } from '@neoface/sdk';

const nfl = new NeoFace({ apiKey: process.env.NFL_KEY });

const result = await nfl.verify({
  userId: 'usr_8f2ka92',
  modalities: ['face', 'liveness'],
  threshold: 0.97,
  enclave: true,
});

// {
//   verified: true,
//   confidence: 0.9987,
//   liveness_score: 0.9941,
//   latency_ms: 87,
//   session_token: "nfl_sess_..."
// }`,
  Python: `from neoface import NeoFace

nfl = NeoFace(api_key=os.environ["NFL_KEY"])

result = nfl.verify(
    user_id="usr_8f2ka92",
    modalities=["face", "liveness"],
    threshold=0.97,
    enclave=True,
)

# {
#   "verified": True,
#   "confidence": 0.9987,
#   "liveness_score": 0.9941,
#   "latency_ms": 87,
#   "session_token": "nfl_sess_..."
# }`,
  cURL: `curl -X POST https://api.neoface.io/v1/verify \\
  -H "Authorization: Bearer $NFL_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "usr_8f2ka92",
    "modalities": ["face", "liveness"],
    "threshold": 0.97,
    "enclave": true
  }'

# Response:
# { "verified": true, "confidence": 0.9987,
#   "liveness_score": 0.9941, "latency_ms": 87 }`,
  Go: `client := neoface.NewClient(os.Getenv("NFL_KEY"))

result, err := client.Verify(ctx, &neoface.VerifyRequest{
  UserID:     "usr_8f2ka92",
  Modalities: []string{"face", "liveness"},
  Threshold:  0.97,
  Enclave:    true,
})

// result.Verified     → true
// result.Confidence   → 0.9987
// result.LatencyMs    → 87`,
};

function highlight(code: string) {
  return code
    .replace(/(\/\/.*)/g, '<span style="color:#4a5568">$1</span>')
    .replace(/(#.*)/g, '<span style="color:#4a5568">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#00E5A8">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span style="color:#00C2FF">$1</span>')
    .replace(/\b(const|let|var|import|from|await|async|return|new|print)\b/g, '<span style="color:#a78bfa">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f59e0b">$1</span>');
}

export function APIPreview() {
  const [active, setActive] = useState("Node.js");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(CODE_TABS[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-16 px-6 md:px-12 lg:px-16 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#00E5A8]/[0.03] rounded-full blur-3xl" />
      </div>
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-4 border border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]">
            Developer First
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
            Integrate in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A8] to-[#00C2FF]">
              under 5 minutes.
            </span>
          </h2>
          <p className="text-[14px] text-white/40 max-w-lg mx-auto leading-relaxed">
            One API call. Any modality. Zero credential storage. Built for engineers who refuse to compromise on security.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.06] overflow-hidden bg-[#080808]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex gap-1">
              {Object.keys(CODE_TABS).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`px-4 py-1.5 text-[11px] font-mono rounded-md transition-all duration-200 ${
                    active === tab
                      ? "bg-[#00E5A8]/10 text-[#00E5A8] border border-[#00E5A8]/20"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono text-white/30 hover:text-white/70 border border-white/[0.06] hover:border-white/20 rounded-md transition-all duration-200"
            >
              {copied ? "✓ Copied" : "⎘ Copy"}
            </button>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-[12px] leading-[1.8] font-mono text-white/70">
              <code dangerouslySetInnerHTML={{ __html: highlight(CODE_TABS[active]) }} />
            </pre>
          </div>
          <div className="border-t border-white/[0.04] px-6 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/20">neoface.io/docs/verify</span>
            <span className="text-[10px] font-mono text-[#00E5A8]/60">● 87ms avg latency</span>
          </div>
        </div>

        <div className="text-center mt-8 flex items-center justify-center gap-6">
          <a href="#" className="text-[13px] text-[#00E5A8] hover:text-white transition-colors font-mono underline underline-offset-4">Read the docs →</a>
          <a href="/features" className="text-[13px] text-white/40 hover:text-white transition-colors font-mono">View all SDKs</a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. TRUST BADGES
───────────────────────────────────────────── */
const BADGES = [
  { icon: "🔐", label: "SOC 2 Type II", sub: "Certified" },
  { icon: "🇪🇺", label: "GDPR", sub: "Compliant" },
  { icon: "📋", label: "ISO 27001", sub: "Accredited" },
  { icon: "💳", label: "PCI DSS", sub: "Level 1" },
  { icon: "🔑", label: "FIDO2", sub: "Certified" },
  { icon: "🏥", label: "HIPAA", sub: "Ready" },
];

export function TrustBadges() {
  return (
    <section className="py-14 px-6 md:px-12 lg:px-16 bg-[#030303] border-y border-white/[0.03]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-2">Security & Compliance</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Built to the highest global standards.</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BADGES.map((badge) => (
            <div
              key={badge.label}
              className="group flex flex-col items-center gap-2 py-5 px-3 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-[#00E5A8]/20 hover:bg-[#00E5A8]/[0.02] transition-all duration-300 cursor-default"
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="text-center">
                <div className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors">{badge.label}</div>
                <div className="text-[9px] font-mono text-white/30 group-hover:text-[#00E5A8]/60 transition-colors mt-0.5">{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. INTEGRATION ECOSYSTEM
───────────────────────────────────────────── */
const INTEGRATIONS = [
  { name: "Auth0", category: "Identity" },
  { name: "Firebase", category: "Backend" },
  { name: "Supabase", category: "Database" },
  { name: "Clerk", category: "Auth" },
  { name: "AWS Cognito", category: "Cloud IAM" },
  { name: "Google Identity", category: "OAuth" },
  { name: "Okta", category: "Enterprise SSO" },
  { name: "Keycloak", category: "Open Source" },
  { name: "NextAuth", category: "Next.js" },
  { name: "Stytch", category: "Passkeys" },
  { name: "Permit.io", category: "Authorization" },
  { name: "WorkOS", category: "Enterprise" },
];

export function IntegrationGrid() {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-16 bg-black overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-[45fr_55fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#00C2FF]/20 bg-[#00C2FF]/5 text-[#00C2FF]">
              Ecosystem
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5 leading-tight">
              Plugs into<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-[#a78bfa]">your existing stack.</span>
            </h2>
            <p className="text-[14px] text-white/40 leading-relaxed mb-7">
              NeoFace drops in alongside your current auth provider. No rip-and-replace — add biometric identity as a layer on whatever you already run.
            </p>
            <a href="/features" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 rounded-full text-[13px] text-white/70 hover:text-white transition-all duration-300">
              View all integrations →
            </a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-[#00C2FF]/20 hover:bg-[#00C2FF]/[0.02] transition-all duration-300 cursor-default text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] group-hover:bg-[#00C2FF]/10 transition-colors flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-sm bg-white/20 group-hover:bg-[#00C2FF]/50 transition-colors" />
                </div>
                <div className="text-[10px] font-semibold text-white/60 group-hover:text-white/90 transition-colors leading-tight">{item.name}</div>
                <div className="text-[8px] font-mono text-white/20 group-hover:text-[#00C2FF]/50 transition-colors">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   5. WHERE IDENTITY IS HEADING & INDUSTRY SIGNALS
───────────────────────────────────────────── */
const ScanFaceIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M3 17v2a2 2 0 0 0 2 2h2" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
    <path d="M12 11v2" />
  </svg>
);

const QUOTE_CARDS = [
  {
    quote: "Passwords are becoming increasingly obsolete. The future is moving toward phishing-resistant authentication like passkeys and biometrics.",
    author: "Satya Nadella",
    company: "Microsoft",
    roleOnly: "Chairman & CEO",
    accent: "#00C2FF",
    glowHsl: "194 100 50",
    initials: "SN"
  },
  {
    quote: "The best password is the one you never have to remember. Biometrics combined with modern authentication provide both better security and a better user experience.",
    author: "Tim Cook",
    company: "Apple",
    roleOnly: "CEO",
    accent: "#00E5A8",
    glowHsl: "164 100 45",
    initials: "TC"
  },
  {
    quote: "The industry is moving beyond passwords toward stronger authentication based on the person rather than what they know.",
    author: "Alex Weinert",
    company: "Microsoft",
    roleOnly: "Former VP, Identity Security",
    accent: "#a78bfa",
    glowHsl: "258 90 75",
    initials: "AW"
  },
  {
    quote: "Identity has become the new security perimeter. Strong authentication is fundamental to protecting modern organizations.",
    author: "George Kurtz",
    company: "CrowdStrike",
    roleOnly: "Founder & CEO",
    accent: "#3b82f6",
    glowHsl: "217 90 60",
    initials: "GK"
  }
];

const STAT_CARDS = [
  {
    stat: "81%",
    title: "Credential-Based Breaches",
    description: "81% of breaches involve compromised or weak credentials, highlighting why password-centric security is no longer enough.",
    icon: ShieldAlert,
    gradient: "from-white/[0.02] via-transparent to-transparent",
    textGlow: "from-white to-zinc-400",
    accent: "#f43f5e",
    glowHsl: "350 90 60"
  },
  {
    stat: "99.9%",
    title: "Preventable Attacks",
    description: "99.9% of account compromise attacks can be prevented with phishing-resistant multi-factor authentication.",
    icon: ShieldCheck,
    gradient: "from-white/[0.02] via-transparent to-transparent",
    textGlow: "from-white to-zinc-400",
    accent: "#10b981",
    glowHsl: "160 85 45"
  },
  {
    stat: "Apple • Google • Microsoft",
    title: "Passkeys Are Here",
    description: "Passkeys are now supported across Apple, Google, and Microsoft ecosystems, accelerating the shift toward passwordless authentication.",
    icon: Fingerprint,
    gradient: "from-white/[0.02] via-transparent to-transparent",
    textGlow: "from-white to-zinc-400",
    accent: "#a78bfa",
    glowHsl: "258 90 75"
  },
  {
    stat: "Billions",
    title: "Biometric Authentications",
    description: "Billions of biometric authentications occur every day across consumer devices, making biometrics a mainstream security standard.",
    icon: ScanFaceIcon,
    gradient: "from-white/[0.02] via-transparent to-transparent",
    textGlow: "from-white to-zinc-400",
    accent: "#00C2FF",
    glowHsl: "194 100 50"
  }
];

export function Testimonials() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 px-6 md:px-12 lg:px-16 bg-transparent border-t border-white/[0.04] overflow-hidden relative">
      {/* Background soft glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* ── Editorial Quote Section Header ── */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.2em] mb-4 border border-white/10 bg-white/[0.02] text-white/50">
            The Future of Authentication
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-tight font-sans">
            Where Identity is Heading
          </h2>
          <p className="text-[15.5px] leading-relaxed text-white/50 font-light font-sans">
            The world's leading security experts agree that authentication is shifting beyond passwords toward phishing-resistant, passwordless identity. NeoFace is built for that future.
          </p>
        </div>

        {/* ── 4 Industry Voice Quote Cards ── */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 items-stretch"
        >
          {QUOTE_CARDS.map((item, idx) => (
            <motion.div key={idx} variants={cardVariants} className="h-full flex flex-col">
              <BorderGlow
                className="h-full transition-all duration-500 hover:-translate-y-1"
                edgeSensitivity={25}
                glowColor={item.glowHsl}
                backgroundColor="#09090b"
                borderRadius={24}
                glowRadius={40}
                glowIntensity={0.8}
                colors={[item.accent, `${item.accent}88`, '#050505']}
                fillOpacity={0.15}
              >
                <div className="flex flex-col justify-between p-7 min-h-[350px] h-full relative z-10">
                  {/* Custom glowing background corner orb on hover */}
                  <div 
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-[0.12] transition-opacity duration-700 blur-3xl pointer-events-none"
                    style={{ backgroundColor: item.accent }}
                  />

                  {/* Soft noise texture overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Animated quotes icon */}
                  <div className="flex justify-between items-start mb-6">
                    <Quote 
                      className="w-7 h-7 opacity-20 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" 
                      style={{ color: item.accent }} 
                    />
                    {/* Subtle hover accent badge */}
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.accent }} />
                  </div>

                  <p className="text-[14px] leading-relaxed text-white/60 font-light font-sans mb-8 flex-1">
                    "{item.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-auto border-t border-white/[0.06] pt-6 w-full">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[10.5px] font-mono font-bold text-white shadow-inner flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${item.accent}22 0%, ${item.accent}05 100%)`,
                        border: `1px solid ${item.accent}33`
                      }}
                    >
                      {item.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14.5px] font-bold text-white tracking-tight leading-snug truncate">
                        {item.author}
                      </div>
                      <div className="text-[11px] font-mono mt-1 flex flex-wrap items-center gap-1.5 leading-none">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
                        <span className="font-bold uppercase tracking-wider" style={{ color: item.accent }}>
                          {item.company}
                        </span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/45 truncate">
                          {item.roleOnly}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Industry Signals Section ── */}
        <div className="text-center mb-12 max-w-3xl mx-auto pt-4">



          <div className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight font-sans">
            Industry Signals
          </div>
          <p className="text-[15px] leading-relaxed text-white/50 font-light font-sans">
            The transition to passwordless authentication is already underway across enterprises, operating systems, and consumer devices.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {STAT_CARDS.map((card, idx) => {
            const Icon = card.icon;

            return (
              <motion.div key={idx} variants={cardVariants} className="h-full flex flex-col">
                <BorderGlow
                  className="h-full transition-all duration-500 hover:-translate-y-1"
                  edgeSensitivity={25}
                  glowColor={card.glowHsl}
                  backgroundColor="#09090b"
                  borderRadius={24}
                  glowRadius={40}
                  glowIntensity={0.8}
                  colors={[card.accent, `${card.accent}88`, '#050505']}
                  fillOpacity={0.15}
                >
                  <div className="flex flex-col justify-between p-7 min-h-[350px] h-full relative z-10">
                    {/* Custom glowing background corner orb on hover */}
                    <div 
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-[0.12] transition-opacity duration-700 blur-3xl pointer-events-none"
                      style={{ backgroundColor: card.accent }}
                    />

                    {/* Soft noise texture overlay */}
                    <div 
                      className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-5">
                        {/* Large glowing stat number */}
                        <div className="min-w-0">
                          <span 
                            className={`${card.stat.length > 8 ? "text-base md:text-lg" : "text-3xl md:text-4xl"} font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                          >
                            {card.stat}
                          </span>
                        </div>
                        <Icon className="w-5.5 h-5.5" style={{ color: card.accent }} />
                      </div>
                      
                      <div className="font-black text-white tracking-tight leading-tight mb-3" style={{ fontSize: '18px', lineHeight: '1.25' }}>
                        {card.title}
                      </div>
                      
                      <p className="font-sans font-light leading-relaxed text-white/70" style={{ fontSize: '13.5px', lineHeight: '1.55' }}>
                        {card.description}
                      </p>
                    </div>

                    <div>
                      <div className="w-full h-px bg-white/5 mb-3.5" />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white/20" style={{ fontSize: '9px' }}>NFL_SIGNAL_VERIFY</span>
                        <a href="/pricing" className="font-bold text-white hover:text-[#00E5A8] transition-colors flex items-center gap-1 font-sans" style={{ fontSize: '11.5px' }}>
                          View Case Study
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. LIVE DEMO CTA
───────────────────────────────────────────── */
export function DemoCTA() {
  return (
    <section className="relative py-16 px-6 md:px-12 lg:px-16 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#00E5A8_0%,transparent_65%)] opacity-[0.03]" />
      </div>
      <div className="max-w-[1440px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Animated biometric scan mockup */}
          <div className="relative flex items-center justify-center py-8">
            <div className="relative w-52 h-52">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#00E5A8]/20"
                  style={{ animation: `demoping 2s ${i * 0.6}s cubic-bezier(0, 0, 0.2, 1) infinite`, opacity: 0 }}
                />
              ))}
              <div className="absolute inset-8 rounded-full border border-[#00E5A8]/30" />
              <div className="absolute inset-12 rounded-full border-2 border-[#00E5A8]/60 bg-[#00E5A8]/[0.03] flex items-center justify-center">
                <div className="text-3xl">👤</div>
              </div>
              <div className="absolute inset-12 rounded-full overflow-hidden" style={{ clipPath: "inset(0 0 0 0 round 50%)" }}>
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5A8] to-transparent" style={{ animation: "demoscan 2s ease-in-out infinite" }} />
              </div>
              {[["top-0", "left-0"], ["top-0", "right-0"], ["bottom-0", "left-0"], ["bottom-0", "right-0"]].map(([v, h], i) => (
                <div key={i} className={`absolute ${v} ${h} w-5 h-5`}>
                  <div className="absolute w-full h-px bg-[#00E5A8]" style={{ top: i < 2 ? 0 : "auto", bottom: i >= 2 ? 0 : "auto" }} />
                  <div className="absolute h-full w-px bg-[#00E5A8]" style={{ left: i % 2 === 0 ? 0 : "auto", right: i % 2 === 1 ? 0 : "auto" }} />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/20 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] animate-pulse" />
              <span className="text-[10px] font-mono text-[#00E5A8]">Scanning liveness...</span>
            </div>
          </div>
          {/* CTA copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-5 border border-[#00E5A8]/20 bg-[#00E5A8]/5 text-[#00E5A8]">
              Live Demo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5 leading-tight">
              See NeoFace verify<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5A8] to-[#00C2FF]">in 60 seconds.</span>
            </h2>
            <p className="text-[14px] text-white/40 leading-relaxed mb-8">
              No integration. No credit card. No sales call. Just open the demo and let NeoFace verify your face in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-7 py-3.5 bg-[#00E5A8] hover:bg-[#00d49a] text-black font-semibold text-[13px] rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,229,168,0.3)]">
                Launch Live Demo
              </button>
              <button className="px-7 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-white/70 hover:text-white font-medium text-[13px] rounded-full transition-all duration-300">
                Book a Call →
              </button>
            </div>
            <p className="mt-4 text-[10px] font-mono text-white/20">No integration required · Works on any device · Results in &lt;100ms</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes demoscan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        @keyframes demoping { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   7. BLOG TEASER
───────────────────────────────────────────── */
const POSTS = [
  {
    tag: "Research", date: "Jun 2026",
    title: "Multi-Modal Fusion Outperforms Single-Mode Auth by 3×",
    excerpt: "Our fusion engine combines face, iris, and behavior signals to achieve 99.97% accuracy — a significant leap beyond any single-modality approach.",
    accent: "#00E5A8",
  },
  {
    tag: "Engineering", date: "May 2026",
    title: "Zero-Knowledge Biometric Matching at 87ms",
    excerpt: "A deep dive into our enclave architecture, homomorphic hashing pipeline, and why we chose hardware-backed TEEs over software sandboxes.",
    accent: "#00C2FF",
  },
  {
    tag: "Security", date: "Apr 2026",
    title: "Why Passive Liveness Detection Beats Active Prompts",
    excerpt: "Active liveness tests can be defeated with video replay attacks. We explain why passive continuous verification is the only production-safe approach.",
    accent: "#a78bfa",
  },
];

export function BlogTeaser() {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-16 bg-[#030303] border-t border-white/[0.03]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider mb-3 border border-white/10 bg-white/[0.02] text-white/50">
              From the Lab
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">How we think<br />about identity.</h2>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-2 text-[12px] font-mono text-white/40 hover:text-white transition-colors flex-shrink-0 ml-4">All articles →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="group flex flex-col justify-between p-6 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.025] transition-all duration-300 cursor-pointer min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    className="text-[9px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0"
                    style={{ color: post.accent, backgroundColor: `${post.accent}15` }}
                  >
                    {post.tag}
                  </span>
                  <span className="text-[10px] font-mono text-white/25">{post.date}</span>
                </div>
                <div className="text-[15px] font-bold text-white/90 group-hover:text-white leading-snug mb-3 transition-colors break-words">{post.title}</div>
                <p className="text-[12px] text-white/40 leading-relaxed break-words">{post.excerpt}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-[11px] font-mono transition-colors flex-shrink-0" style={{ color: post.accent }}>
                Read more <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
