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
            Legal
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Refund & Cancellation Policy{" "}
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
            Understand plan upgrading, downgrading, overage billing credits, and refund criteria for our cloud tiers.
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
              <h2 className="text-base font-bold text-white mb-4">Billing Cancellation Rules</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <p>
                  Our goal is absolute transparency in pricing operations. Read our upgrade and refund parameters:
                </p>
                <ul className="space-y-2 list-disc pl-4 text-white/50 text-[12.5px]">
                  <li><strong>Tier Downgrades:</strong> Take effect on the subsequent billing cycle. Unused verifications do not roll over.</li>
                  <li><strong>Overage Billing:</strong> Computed at the end of each monthly cycle matching the published overage rates.</li>
                  <li><strong>Refund Requests:</strong> Eligible within 7 days of initial subscription upgrades. Contact support for dispute review.</li>
                </ul>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
