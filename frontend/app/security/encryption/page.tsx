"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";
import BorderGlow from "../../components/ui/BorderGlow";
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
            Security
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Encryption Standards{" "}
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
            Deep dive into homomorphic hashing, ephemeral session keys, AES-256-GCM storage, and TLS 1.3 transport encryption.
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
              <h2 className="text-base font-bold text-white mb-4">Cryptographic Details</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Every data package carries multi-layered encryption:</p>
                <div className="space-y-2 pt-1 text-[12.5px]">
                  <div><strong>Transport:</strong> Strictly TLS 1.3 connection protocol with Perfect Forward Secrecy.</div>
                  <hr className="border-white/5" />
                  <div><strong>Biometric Templates:</strong> Encrypted homomorphic signatures stored in AES-256-GCM containers.</div>
                  <hr className="border-white/5" />
                  <div><strong>Verification Keys:</strong> Hardware-locked HSM root keys with automatic rotation cycles.</div>
                </div>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
