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
              borderColor: "#f43f5e20",
              backgroundColor: "#f43f5e05",
              color: "#f43f5e"
            }}
          >
            Risk Engine
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Biometric Trust Engine{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #f43f5e, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Real-time anomaly scoring. Evaluates presentation attack metrics, deepfake injection scores, and hardware integrity telemetry.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="350 90 60"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#f43f5e', '#f43f5e88', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Trust Scoring Parameters</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  Our Trust Engine processes real-time device signals to yield a composite integrity score:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">Presentation Attack (PAD)</h3>
                    <p className="text-[12px] text-white/40">Detects paper, screen, or 3D silicone mask projections under 100ms.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">Deepfake Neural Filter</h3>
                    <p className="text-[12px] text-white/40">Scans for camera injection feeds, virtual devices, and synthetic texture distortions.</p>
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
