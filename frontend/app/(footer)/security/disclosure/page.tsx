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
              borderColor: "#a78bfa20",
              backgroundColor: "#a78bfa05",
              color: "#a78bfa"
            }}
          >
            Security
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Responsible Bug Disclosure{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Vulnerability reporting guidelines, PGPs keys, scope of testing, and bounty payouts for security researchers.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="258 90 75"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#a78bfa', '#a78bfa88', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Vulnerability Program</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  We welcome responsible research from ethical hackers. Submit bugs to <code>security@neoface.io</code>.
                </p>
                <h3 className="font-semibold text-white mt-4 mb-2">Bounty Reward Levels</h3>
                <div className="grid grid-cols-3 gap-3 font-mono text-[11px] text-center">
                  <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    <strong>Critical</strong><br />Up to $10,000
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <strong>Medium</strong><br />Up to $2,500
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <strong>Low</strong><br />Up to $500
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
