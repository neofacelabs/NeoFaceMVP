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
              borderColor: "#10b98120",
              backgroundColor: "#10b98105",
              color: "#10b981"
            }}
          >
            Developers
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Quick Start Guide{" "}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r"
              style={{
                backgroundImage: "linear-gradient(to right, #10b981, #00C2FF)"
              }}
            >
              Portal
            </span>
          </h1>
          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans max-w-2xl">
            From zero to verified in under five minutes. Install the libraries, configure your API keys, and run your first identity assertion.
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
            colors={['#10b981', '#10b98188', '#050505']}
            fillOpacity={0.12}
          >
            <div className="p-8 relative z-10">
              <h2 className="text-base font-bold text-white mb-4">SDK Installation & Quick Code</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>Install the official client SDK:</p>
                <pre className="p-4 rounded-xl bg-black/45 border border-white/[0.04] text-[12px] font-mono text-emerald-400">
                  npm install @neoface/sdk
                </pre>
                <p>Initialize and execute authentication:</p>
                <pre className="p-4 rounded-xl bg-black/45 border border-white/[0.04] text-[12px] font-mono text-white/80 overflow-x-auto whitespace-pre">
                  {`import { NeoFace } from '@neoface/sdk';\nconst nfl = new NeoFace({ apiKey: 'YOUR_KEY' });\n\nconst res = await nfl.verify({\n  userId: 'usr_1002',\n  modalities: ['face', 'liveness']\n});\nconsole.log(res.verified); // true`}
                </pre>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
