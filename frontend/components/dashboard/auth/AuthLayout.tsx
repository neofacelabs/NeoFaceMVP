import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScanFace, Fingerprint, KeyRound, Shield, Layers, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const FEATURE_CARDS = [
  {
    title: "Face Recognition",
    desc: "Liveness & active matching",
    status: "Verified",
    icon: ScanFace,
    accent: "from-blue-500/20 to-sky-500/5 text-blue-400",
    initialY: -20,
    animateY: [0, -14, 0],
    duration: 6.5,
    delay: 0,
    translateX: "translate-x-[20px]",
    depth: "blur-[0.5px] scale-[0.95] opacity-80",
  },
  {
    title: "WebAuthn",
    desc: "Passwordless Login",
    status: "Passkey Ready",
    icon: KeyRound,
    accent: "from-indigo-500/20 to-purple-500/5 text-indigo-400",
    initialY: 30,
    animateY: [0, 10, 0],
    duration: 8,
    delay: 1.2,
    translateX: "translate-x-[-30px]",
    depth: "blur-0 scale-100 opacity-95 z-20",
  },
  {
    title: "Fingerprint Auth",
    desc: "Biometric Match",
    status: "Active",
    icon: Fingerprint,
    accent: "from-blue-500/15 to-indigo-500/5 text-blue-400",
    initialY: -40,
    animateY: [0, -16, 0],
    duration: 9.5,
    delay: 0.5,
    translateX: "translate-x-[0px]",
    depth: "blur-[0.8px] scale-[0.9] opacity-75",
  },
  {
    title: "Risk Engine",
    desc: "Adaptive Trust",
    status: "Low Risk",
    icon: ShieldCheck,
    accent: "from-emerald-500/20 to-teal-500/5 text-emerald-400",
    initialY: 10,
    animateY: [0, 12, 0],
    duration: 7,
    delay: 2.1,
    translateX: "translate-x-[30px]",
    depth: "blur-[1.2px] scale-[0.85] opacity-65",
  },
];

const CORE_FEATURES = [
  {
    title: "Face Recognition",
    desc: "Passive and active biometric verification",
    icon: ScanFace,
  },
  {
    title: "WebAuthn",
    desc: "Passwordless authentication",
    icon: KeyRound,
  },
  {
    title: "Multi-Factor Authentication",
    desc: "Adaptive trust engine",
    icon: Shield,
  },
  {
    title: "Device Intelligence",
    desc: "Continuous device verification",
    icon: Layers,
  },
] as const;

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row relative overflow-hidden font-sans select-none">
      
      {/* Noise overlay texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background Gradients & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none" />
      
      {/* Moving Ambient Blobs */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-blue-600/[0.025] rounded-full blur-[140px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1.1, 0.95, 1.1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[20%] left-[40%] w-[400px] h-[400px] bg-emerald-500/[0.012] rounded-full blur-[120px] pointer-events-none"
      />

      {/* Faint Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Left side soft particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-10, 10, -10], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-10 w-2 h-2 rounded-full bg-blue-400 blur-[2px]"
        />
        <motion.div
          animate={{ y: [10, -10, 10], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-[35%] w-1.5 h-1.5 rounded-full bg-cyan-400 blur-[1px]"
        />
      </div>

      {/* LEFT PANEL: Branding & Visuals (55% desktop, hidden on mobile/tablet) */}
      <div className="w-full lg:w-[55%] hidden lg:flex flex-col justify-between p-16 lg:p-24 relative z-10 border-r border-white/[0.03] bg-black/10">
        
        {/* Top whitespace placeholder */}
        <div className="h-6" />

        {/* Core Identity Panel */}
        <div className="my-auto max-w-[480px]">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent"
          >
            Build Trust.<br />
            Authenticate Anyone.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-[15px] text-white/45 leading-relaxed mb-16 font-medium"
          >
            Enterprise-grade biometric authentication infrastructure for modern applications. Secure endpoints with passive validation systems.
          </motion.p>

          {/* Clean product capabilities cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {CORE_FEATURES.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4 group">
                  <div className="h-9 w-9 rounded-xl bg-white/[0.015] border border-white/[0.04] flex items-center justify-center text-white/40 shrink-0 group-hover:bg-blue-500/5 group-hover:text-blue-400 group-hover:border-blue-500/25 transition-all duration-300">
                    <IconComp size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[13.5px] font-semibold text-white/75 group-hover:text-white transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-white/35 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Ambient signature logo label */}
        <div className="text-[10px] text-white/20 tracking-[0.2em] uppercase font-bold">
          NeoFace Platform
        </div>

        {/* FLOATING PRODUCT UI GLASS CARDS: Stacked in a flex column to prevent overlapping, with custom offsets */}
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[340px] hidden xl:flex flex-col gap-5 pointer-events-none z-25">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ y: card.initialY, opacity: 0 }}
                animate={{
                  y: card.animateY as any,
                  opacity: 1,
                  rotate: [0, idxRotate(card.title), 0],
                }}
                transition={{
                  y: {
                    duration: card.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: card.delay,
                  },
                  rotate: {
                    duration: card.duration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: card.delay,
                  },
                  opacity: { duration: 0.8 },
                }}
                className={`p-4 rounded-[20px] border border-white/[0.04] bg-white/[0.015] shadow-[0_24px_50px_rgba(0,0,0,0.65)] backdrop-blur-3xl flex items-center gap-3.5 relative ${card.translateX} ${card.depth}`}
              >
                {/* Visual Glass reflection line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-b ${card.accent} border border-white/[0.05] flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11.5px] font-bold text-white tracking-tight">{card.title}</h5>
                  <p className="text-[10px] text-white/40 font-medium mt-0.5">{card.desc}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-full text-[9px] font-bold text-white/40">
                  <span>{card.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Auth Card Area (Centered form on all device widths, 45% desktop) */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 min-h-screen">
        <div className="w-full max-w-[400px] flex flex-col gap-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Helpers for rotational wobble
function idxRotate(title: string): number {
  if (title.includes("Face")) return 1.5;
  if (title.includes("Web")) return -1.2;
  if (title.includes("Finger")) return 0.8;
  return -1.0;
}
