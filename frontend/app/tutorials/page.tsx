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
            Developer Hub
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Video & Code Tutorials{" "}
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
            Interactive guides, walkthrough code repositories, and building end-to-end flows with Next.js, Flutter, and React Native.
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
              <h2 className="text-base font-bold text-white mb-4">Step-by-step Build Walks</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Build biometric authentication in your framework using code walk templates:</p>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">Next.js 16 WebAuthn Setup</h4>
                      <p className="text-[11.5px] text-white/45">Integrate face liveness verification into your standard server component middleware.</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">10 min walk</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">React Native Biometric Passkey setup</h4>
                      <p className="text-[11.5px] text-white/45">Binding FaceID checks directly inside mobile hardware keys enclaves.</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">15 min walk</span>
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
