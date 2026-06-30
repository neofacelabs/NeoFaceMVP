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
            Developers
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Quick Start Guide{" "}
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
            From zero to verified in under five minutes. Install the libraries, configure your API keys, and run your first identity assertion.
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
              <h2 className="text-lg font-bold text-white mb-4">Core Specifications & Guides</h2>
              <div className="space-y-6 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  Welcome to the official Quick Start Guide center. This module provides verified integrations, 
                  architectural whitepapers, and operational tools designed for developer-centric deployment.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1.5">Overview</h3>
                    <p className="text-[12px] text-white/40">
                      Standard operational flows, interface declarations, and SDK schema mappings.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1.5">Integration Steps</h3>
                    <p className="text-[12px] text-white/40">
                      Configure your environment credentials, setup endpoint triggers, and check compliance rules.
                    </p>
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
