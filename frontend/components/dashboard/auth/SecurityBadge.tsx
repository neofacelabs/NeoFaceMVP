import React from "react";
import { Shield } from "lucide-react";

export function SecurityBadge() {
  return (
    <div className="flex flex-col items-center gap-2 mt-8 text-center">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
        <Shield size={11} className="text-[#3B82F6] shrink-0" />
        <span>Secured by NeoFace</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10.5px] text-white/30 font-medium">
        <span>• End-to-end encrypted</span>
        <span>• Passwordless authentication</span>
        <span>• Biometric verification</span>
        <span>• Passkeys</span>
        <span>• Zero-knowledge architecture</span>
      </div>
    </div>
  );
}
