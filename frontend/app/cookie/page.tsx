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
              borderColor: "#00C2FF20",
              backgroundColor: "#00C2FF05",
              color: "#00C2FF"
            }}
          >
            Legal
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Cookie Policy{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #00C2FF, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Review our minimal usage of cookies and local storage. We only track essential session variables — zero third-party scripts.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="194 100 50"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#00C2FF', '#00C2FF88', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Cookie Specifications</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  We operate a zero-tracker platform. Only strictly functional, session-bound cookies are stored:
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <span className="font-mono text-emerald-400 text-[12px]">__nfl_session</span>
                    <span className="text-white/45 text-[11px]">Strictly functional session verification cookie</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <span className="font-mono text-emerald-400 text-[12px]">__nfl_mfa_proof</span>
                    <span className="text-white/45 text-[11px]">Secures active biometric hardware assertions</span>
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
