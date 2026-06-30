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
              borderColor: "#3b82f620",
              backgroundColor: "#3b82f605",
              color: "#3b82f6"
            }}
          >
            Integrations
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Real-time Webhook Events{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #3b82f6, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Configure event notifications for system-wide lifecycle alerts: identity.enrolled, identity.verified, session.failed, and more.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="217 91 60"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#3b82f6', '#3b82f688', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Supported Event Registrations</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Register webhooks to receive real-time JSON payloads on operational events:</p>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] font-mono text-[12px] flex items-center justify-between">
                    <span className="text-blue-400">identity.enrolled</span>
                    <span className="text-white/45 text-[11px]">Fires upon successful biometric template storage</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] font-mono text-[12px] flex items-center justify-between">
                    <span className="text-blue-400">identity.verified</span>
                    <span className="text-white/45 text-[11px]">Fires upon successful session biometric match</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] font-mono text-[12px] flex items-center justify-between">
                    <span className="text-blue-400">session.failed</span>
                    <span className="text-white/45 text-[11px]">Fires when threshold liveness check flags fraud</span>
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
