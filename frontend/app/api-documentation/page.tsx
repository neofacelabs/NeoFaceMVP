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
            API Docs
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Developer API Reference{" "}
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
            Complete REST endpoint documentation, payload schemas, error codes, response examples, and rate limit architectures.
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
              <h2 className="text-base font-bold text-white mb-4">Payload Specifications</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Every REST API call requires an <code>Authorization</code> header:</p>
                <pre className="p-4 rounded-xl bg-black/45 border border-white/[0.04] text-[12px] font-mono text-white/80">
                  Authorization: Bearer nfl_live_your_api_key_secret
                </pre>
                <h3 className="font-semibold text-white mt-4">Error Code Directory</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                    <span className="font-mono text-red-400 block text-[12px]">401 Unauthorized</span>
                    <span className="text-[11px] text-white/45">Missing/invalid key</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                    <span className="font-mono text-red-400 block text-[12px]">422 Invalid Modality</span>
                    <span className="text-[11px] text-white/45">Biometrics quality low</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                    <span className="font-mono text-red-400 block text-[12px]">429 Rate Limited</span>
                    <span className="text-[11px] text-white/45">Quota ceiling hit</span>
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
