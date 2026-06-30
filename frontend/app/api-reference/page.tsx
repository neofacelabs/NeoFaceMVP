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
            API Reference
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            REST API Specification{" "}
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
            Interactive OpenAPI reference for enrolling identities, verifying sessions, checking liveness detection diagnostics, and configuring webhooks.
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
              <h2 className="text-base font-bold text-white mb-4">Core Endpoint Directory</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  All request payloads must be encoded in JSON format and carry valid authorization tokens.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/45 border border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">POST</span>
                      <span className="font-mono text-[12px] text-white">/v1/identities/enroll</span>
                    </div>
                    <span className="text-[11px] text-white/45">Register a new biometric profile</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/45 border border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">POST</span>
                      <span className="font-mono text-[12px] text-white">/v1/identities/verify</span>
                    </div>
                    <span className="text-[11px] text-white/45">Verify live presence and credentials</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/45 border border-white/[0.04] flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">GET</span>
                      <span className="font-mono text-[12px] text-white">/v1/sessions/:session_id</span>
                    </div>
                    <span className="text-[11px] text-white/45">Fetch verification session logs</span>
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
