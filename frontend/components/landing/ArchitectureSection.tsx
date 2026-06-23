"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const LAYERS = [
  {
    id: "banking",
    label: "Banking & Finance",
    sublabel: "High-assurance login & transaction auth",
    color: "#00E5A8",
    nodes: ["Branch Login", "Wire Auth", "Iris Verify", "Compliance"],
  },
  {
    id: "enterprise",
    label: "Enterprise SSO",
    sublabel: "Passwordless workforce authentication",
    color: "#00C2FF",
    nodes: ["SAML 2.0", "OIDC", "MFA Replace", "Zero Trust"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    sublabel: "HIPAA-compliant patient identity",
    color: "#00FFD1",
    nodes: ["Patient Auth", "EHR Access", "Prescription", "Telemedicine"],
  },
  {
    id: "consumer",
    label: "Consumer Apps",
    sublabel: "Frictionless user login at scale",
    color: "#00C2FF",
    nodes: ["Face Login", "Fingerprint", "Liveness SDK", "Risk Score"],
  },
  {
    id: "fintech",
    label: "Fintech & Payments",
    sublabel: "Biometric auth before every transaction",
    color: "#00E5A8",
    nodes: ["Auth API", "Open Banking", "Wallet Guard", "PSD2 SCA"],
  },
];

function FlowArrow({ color }: { color: string }) {
  return (
    <div className="flex justify-center py-2">
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
        <line x1="16" y1="0" x2="16" y2="16" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="3 4">
          <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.5s" repeatCount="indefinite"/>
        </line>
        <path d="M10 12 L16 20 L22 12" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      </svg>
    </div>
  );
}

function ArchLayer({ layer, index }: { layer: typeof LAYERS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="relative rounded-2xl border p-5 overflow-hidden"
        style={{
          borderColor: `${layer.color}20`,
          background: `${layer.color}05`,
        }}
      >
        {/* Layer label */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[13px] font-semibold text-white">{layer.label}</div>
            <div className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5 font-mono">{layer.sublabel}</div>
          </div>
          <div
            className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full"
            style={{ color: layer.color, background: `${layer.color}12`, border: `1px solid ${layer.color}25` }}
          >
            USE CASE {index + 1}
          </div>
        </div>

        {/* Nodes */}
        <div className="flex gap-2 flex-wrap">
          {layer.nodes.map((node) => (
            <div
              key={node}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium border"
              style={{
                color: `${layer.color}cc`,
                borderColor: `${layer.color}20`,
                background: `${layer.color}08`,
              }}
            >
              {node}
            </div>
          ))}
        </div>

        {/* Flow indicator on left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
          style={{ background: `linear-gradient(to bottom, transparent, ${layer.color}60, transparent)` }}
        />
      </div>
    </motion.div>
  );
}

export function ArchitectureSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="architecture" ref={ref} className="relative section-pad px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(0,229,168,0.04) 0%, transparent 70%)" }}
      />
      {/* ── Subtle Dot Grid Pattern ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-100"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-24"
          >
            <div className="tag tag-accent inline-flex mb-6">Use cases</div>
            <h2 className="text-title-1 text-white mb-5">
              One Platform.<br />
              <span className="text-gradient-accent">Every Auth Use Case.</span>
            </h2>
            <p className="text-[16px] text-[rgba(255,255,255,0.42)] leading-[1.7] mb-10 max-w-sm">
              NeoFace powers biometric authentication across banking, enterprise, healthcare, consumer apps, and fintech — all from a single API.
            </p>

            {/* Payment stats */}
            <div className="space-y-6">
              {[
                { label: "Deployment",     val: "Cloud or On-Prem",   desc: "Air-gapped enterprise option" },
                { label: "Auth Volume",    val: "10M+ verifies/day",  desc: "At sustained peak load" },
                { label: "Integrations",  val: "Apps, Banks, APIs",  desc: "Plug in to any identity system" },
              ].map(stat => (
                <div key={stat.label} className="flex gap-4 items-start">
                  <div className="w-px h-full bg-[rgba(255,255,255,0.08)] self-stretch min-h-[40px]" />
                  <div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.12em] mb-0.5">{stat.label}</div>
                    <div className="text-[16px] font-semibold text-white">{stat.val}</div>
                    <div className="text-[12px] text-[rgba(255,255,255,0.35)]">{stat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — use case layers */}
          <div className="flex flex-col gap-0">
            {LAYERS.map((layer, i) => (
              <div key={layer.id}>
                <ArchLayer layer={layer} index={i} />
                {i < LAYERS.length - 1 && <FlowArrow color={LAYERS[i + 1].color} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
