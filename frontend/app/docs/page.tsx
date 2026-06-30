"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";
import BorderGlow from "../components/ui/BorderGlow";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <SubpageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-5 border"
            style={{
              borderColor: "#00E5A820",
              backgroundColor: "#00E5A805",
              color: "#00E5A8"
            }}
          >
            Developer Docs
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            NeoFace Labs Documentation{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Integrate secure, hardware-backed biometric authentication. Browse quickstarts, client SDK reference guides, and sample implementations.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="160 85 45"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#00E5A8', '#00E5A888', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Documentation Chapters</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  Our documentation is structured to help you get integrated at any scale. Select a chapter to explore:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] transition-all">
                    <h3 className="font-semibold text-white mb-1">1. Getting Started</h3>
                    <p className="text-[12px] text-white/40">SDK installation, client credential setup, and your first verification run.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] transition-all">
                    <h3 className="font-semibold text-white mb-1">2. Biometric Fusion</h3>
                    <p className="text-[12px] text-white/40">Fusing face geometry, iris scanning, and fingerprint checks into a single trust decision.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] transition-all">
                    <h3 className="font-semibold text-white mb-1">3. Webhooks & Events</h3>
                    <p className="text-[12px] text-white/40">Subscribing to real-time status alerts for enrollment, verification, and audit logs.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] transition-all">
                    <h3 className="font-semibold text-white mb-1">4. Secure Enclaves</h3>
                    <p className="text-[12px] text-white/40">Technical deep dives into homomorphic template encryption inside AWS Nitro and Intel SGX.</p>
                  </div>
                </div>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
