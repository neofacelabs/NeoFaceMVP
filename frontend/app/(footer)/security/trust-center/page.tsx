"use client";
import React from "react";
import SubpageLayout from "../../../components/SubpageLayout";
import BorderGlow from "../../../components/ui/BorderGlow";
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
            Security
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            NeoFace Trust Center{" "}
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
            Real-time system status, security incident reports, security policy documents, and data processing agreements.
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
              <h2 className="text-base font-bold text-white mb-4">Operational Status Indicators</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">All Systems Operational — 99.98% Uptime 30d</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1.5">Penetration Audits</h3>
                    <p className="text-[12px] text-white/40">Bi-annual code penetration reviews performed by Bishop Fox. Clean reports.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1.5">Incident Reports</h3>
                    <p className="text-[12px] text-white/40">Zero recorded security breaches, template compromises, or database leaks.</p>
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
