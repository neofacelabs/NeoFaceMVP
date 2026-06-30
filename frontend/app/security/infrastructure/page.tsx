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
              borderColor: "#00C2FF20",
              backgroundColor: "#00C2FF05",
              color: "#00C2FF"
            }}
          >
            Security
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Enclave Infrastructure{" "}
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
            Sovereign hosting details. AWS Nitro Enclaves, GCP Confidential VMs, and dedicated HSM server deployments.
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
              <h2 className="text-base font-bold text-white mb-4">Infrastructure Setup Details</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  NeoFace operations are hosted inside isolated hardware enclaves:
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">AWS Nitro Enclaves</h3>
                    <p className="text-[12px] text-white/40">Uses virtualization technology to create isolated compute enclaves with no persistent storage.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                    <h3 className="font-semibold text-white mb-1">Intel SGX & Confidential VMs</h3>
                    <p className="text-[12px] text-white/40">Hardware-level memory encryption shields the enclave processing context from hypervisors or host OS users.</p>
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
