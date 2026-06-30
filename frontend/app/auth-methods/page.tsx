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
            Authentication
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Supported Auth Modalities{" "}
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
            Explore multi-modal biometrics: 3D face verification, iris patterns, behavioral characteristics, and device-bound passkey registration.
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
              <h2 className="text-base font-bold text-white mb-4">Supported Biometric Channels</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  NeoFace platform natively supports multi-factor biometric checks to balance speed, user friction, and security parameters.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <div className="text-lg mb-2">📸</div>
                    <h3 className="font-semibold text-white mb-1">Face Ingestion</h3>
                    <p className="text-[11px] text-white/40">Passive 3D face mapping and liveness sweep checking to prevent photo presentation attacks.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <div className="text-lg mb-2">👁️</div>
                    <h3 className="font-semibold text-white mb-1">Iris Match Core</h3>
                    <p className="text-[11px] text-white/40">Standoff iris texture scanning for high-trust military and institutional access control.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <div className="text-lg mb-2">👆</div>
                    <h3 className="font-semibold text-white mb-1">Fingerprint</h3>
                    <p className="text-[11px] text-white/40">Fast, hardware-bound device sensor integration (Touch ID, Windows Hello) for local validation.</p>
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
