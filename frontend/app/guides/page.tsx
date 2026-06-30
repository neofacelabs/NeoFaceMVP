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
              borderColor: "#10b98120",
              backgroundColor: "#10b98105",
              color: "#10b981"
            }}
          >
            Resources
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Integration Guides{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #10b981, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Step-by-step walkthroughs for custom integrations, framework setups, and compliance mappings (SOC 2, GDPR).
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
            colors={['#10b981', '#10b98188', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Regulatory Compliance Blueprints</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Configure your biometric architecture to align with security standard frameworks:</p>
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">GDPR Mapping</h3>
                    <p className="text-[11.5px] text-white/40">Learn how zero-knowledge processing complies with Article 9 requirements for special category biological data.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">SOC 2 Alignment</h3>
                    <p className="text-[11.5px] text-white/40">Secure Audit trails setup, hardware enclave isolation logs, and database access logging templates.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">FIDO2 Setup</h3>
                    <p className="text-[11.5px] text-white/40">Linking webauthn credentials to NeoFace trust scores for multi-modal security assertions.</p>
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
