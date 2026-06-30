"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";
import BorderGlow from "../../components/ui/BorderGlow";
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
            Security
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Security Compliance Matrix{" "}
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
            SOC 2 Type II report downloads, ISO 27001 scopes, and third-party penetration testing summaries.
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
              <h2 className="text-base font-bold text-white mb-4">Audited Certifications</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Request official auditor documentations via contact endpoints:</p>
                <div className="space-y-2 pt-2 font-mono text-[12px]">
                  <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <span>EY SOC 2 Type II Final Report (2026)</span>
                    <a href="mailto:compliance@neoface.io" className="text-emerald-400">Request Audit</a>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <span>ISO/IEC 27001 Certification Certificate</span>
                    <a href="mailto:compliance@neoface.io" className="text-emerald-400">Request Audit</a>
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
