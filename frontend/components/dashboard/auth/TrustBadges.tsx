import React from "react";

const BADGES = [
  "99.99% Uptime",
  "SOC2 Ready",
  "API First",
  "WebAuthn",
  "Encrypted",
] as const;

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
      {BADGES.map((b) => (
        <span
          key={b}
          className="px-2.5 py-0.5 rounded-full border border-white/[0.04] bg-white/[0.01] text-[9.5px] font-semibold text-white/25 tracking-wide"
        >
          {b}
        </span>
      ))}
    </div>
  );
}
