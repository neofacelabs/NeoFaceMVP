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
              borderColor: "#a78bfa20",
              backgroundColor: "#a78bfa05",
              color: "#a78bfa"
            }}
          >
            FAQ
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Frequently Asked Questions{" "}
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
            Answers to common inquiries about integration, data security, biometric storage, pricing, and enclave mechanics.
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
              <h2 className="text-base font-bold text-white mb-4">Common Questions</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">Does NeoFace store my raw camera photos?</h3>
                    <p className="text-white/40">No. Raw camera images are processed on-device locally to extract mathematical templates. The original images are instantly discarded.</p>
                  </div>
                  <hr className="border-white/5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Where does biometric template matching occur?</h3>
                    <p className="text-white/40">All matching logic runs inside hardware-isolated secure enclaves (AWS Nitro Enclaves, Intel SGX). Biometric parameters are never decrypted on central databases.</p>
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
