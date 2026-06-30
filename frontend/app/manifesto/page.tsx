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
              borderColor: "#00E5A820",
              backgroundColor: "#00E5A805",
              color: "#00E5A8"
            }}
          >
            Company Mission
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            The NeoFace Manifesto{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #00E5A8, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            Why passwords must die. Rebuilding global identity infrastructure on zero-knowledge biometrics and sovereign hardware enclaves.
          </p>
        </div>

        <motion.div whileHover={{ y: -4 }} className="w-full">
          <BorderGlow
            className="w-full"
            edgeSensitivity={20}
            glowColor="160 85 45"
            backgroundColor="#09090b"
            borderRadius={24}
            glowRadius={35}
            glowIntensity={0.8}
            colors={['#00E5A8', '#00E5A888', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">Our Core Philosophy</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  Security based on sharing secrets (passwords, PINs, OTP codes) is inherently broken. 
                  If a credential is transmittable, it is stealable. 
                </p>
                <p>
                  Our goal is to build an identity protocol that binds credentials to physical presence 
                  without compromising user confidentiality. No centralized biometric image databases. 
                  Biometric matching runs in isolated, hardware-backed secure enclaves, verifying presence mathematically.
                </p>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
