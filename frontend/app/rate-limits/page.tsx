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
            System Limits
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            Rate Limiting & Quotas{" "}
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
            API request ceilings, burst limits, and backoff recommendations. Keep your production systems optimized and responsive.
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
              <h2 className="text-base font-bold text-white mb-4">Quota Matrix by Tier</h2>
              <div className="space-y-4 text-white/60 text-[13px] leading-relaxed font-light">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-white/5 text-white/40">
                        <th className="py-2.5">Tier Name</th>
                        <th className="py-2.5">Requests/Second (Sustained)</th>
                        <th className="py-2.5">Requests/Second (Burst)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      <tr>
                        <td className="py-2.5 font-semibold text-emerald-400">Free</td>
                        <td className="py-2.5">5 req/s</td>
                        <td className="py-2.5">10 req/s</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-blue-400">Pro</td>
                        <td className="py-2.5">50 req/s</td>
                        <td className="py-2.5">100 req/s</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-indigo-400">Business</td>
                        <td className="py-2.5">250 req/s</td>
                        <td className="py-2.5">500 req/s</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>
    </SubpageLayout>
  );
}
