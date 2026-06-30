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
            Identity Protocol
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            NeoID Decentralized Identity{" "}
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
            Sovereign identity anchoring. Issue verifiable credentials cryptographically locked to hardware biometric hashes.
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
              <h2 className="text-base font-bold text-white mb-4">NeoID Cryptographic Identity Layer</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  NeoID allows users to anchor their digital profile directly on their biometrics without central registry reliance:
                </p>
                <ul className="space-y-2 pl-4 list-disc text-white/50 text-[12.5px]">
                  <li><strong>Verifiable Credentials (VCs):</strong> Fully compliant with W3C standards, cryptographically signed by issuers.</li>
                  <li><strong>Zero-Knowledge Identity Verification:</strong> Prove age or identity attributes without revealing raw personal parameters.</li>
                  <li><strong>Sovereign Keys:</strong> Decentralized identifiers (DIDs) mapped to homomorphic enclave biometric hashes.</li>
                </ul>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
