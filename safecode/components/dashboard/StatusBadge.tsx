"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BiometricStatus, DeviceStatus, MemberStatus, AuthResult } from "@/types/platform";

type StatusType =
  | { variant: "biometric"; status: BiometricStatus }
  | { variant: "device"; status: DeviceStatus }
  | { variant: "member"; status: MemberStatus }
  | { variant: "auth"; status: AuthResult }
  | { variant: "generic"; status: string; color?: "green" | "yellow" | "red" | "blue" | "gray" };

const biometricConfig: Record<BiometricStatus, { label: string; color: string; dot: string }> = {
  enrolled: { label: "Enrolled", color: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20", dot: "bg-[#00E5A8]" },
  pending: { label: "Pending", color: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20", dot: "bg-[#fbbf24]" },
  failed: { label: "Failed", color: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20", dot: "bg-[#f87171]" },
  not_enrolled: { label: "Not Enrolled", color: "text-white/35 bg-white/5 border-white/8", dot: "bg-white/20" },
};

const deviceConfig: Record<DeviceStatus, { label: string; color: string; dot: string; pulse?: boolean }> = {
  online: { label: "Online", color: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20", dot: "bg-[#00E5A8]", pulse: true },
  offline: { label: "Offline", color: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20", dot: "bg-[#f87171]" },
  warning: { label: "Warning", color: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20", dot: "bg-[#fbbf24]", pulse: true },
  maintenance: { label: "Maintenance", color: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20", dot: "bg-[#38BDF8]" },
};

const memberConfig: Record<MemberStatus, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20", dot: "bg-[#00E5A8]" },
  suspended: { label: "Suspended", color: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20", dot: "bg-[#f87171]" },
  inactive: { label: "Inactive", color: "text-white/35 bg-white/5 border-white/8", dot: "bg-white/20" },
  pending: { label: "Pending", color: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20", dot: "bg-[#fbbf24]" },
};

const authConfig: Record<AuthResult, { label: string; color: string; dot: string }> = {
  success: { label: "Success", color: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20", dot: "bg-[#00E5A8]" },
  failed: { label: "Failed", color: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20", dot: "bg-[#f87171]" },
  spoof_detected: { label: "Spoof", color: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20", dot: "bg-[#f87171]" },
  liveness_fail: { label: "Liveness Fail", color: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20", dot: "bg-[#fbbf24]" },
};

export function StatusBadge(props: StatusType & { className?: string; size?: "sm" | "md" }) {
  const { className, size = "sm" } = props;

  let cfg = { label: "", color: "", dot: "", pulse: false as boolean };

  if (props.variant === "biometric") {
    cfg = { ...biometricConfig[props.status], pulse: false };
  } else if (props.variant === "device") {
    cfg = { ...deviceConfig[props.status], pulse: deviceConfig[props.status].pulse ?? false };
  } else if (props.variant === "member") {
    cfg = { ...memberConfig[props.status], pulse: false };
  } else if (props.variant === "auth") {
    cfg = { ...authConfig[props.status], pulse: false };
  } else {
    const colorMap = {
      green: "text-[#00E5A8] bg-[#00E5A8]/10 border-[#00E5A8]/20",
      yellow: "text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20",
      red: "text-[#f87171] bg-[#f87171]/10 border-[#f87171]/20",
      blue: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20",
      gray: "text-white/35 bg-white/5 border-white/8",
    };
    const dotMap = {
      green: "bg-[#00E5A8]",
      yellow: "bg-[#fbbf24]",
      red: "bg-[#f87171]",
      blue: "bg-[#38BDF8]",
      gray: "bg-white/20",
    };
    cfg = {
      label: props.status,
      color: colorMap[props.color ?? "gray"],
      dot: dotMap[props.color ?? "gray"],
      pulse: false,
    };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium",
        size === "sm" ? "text-[10.5px]" : "text-xs",
        cfg.color,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          cfg.dot,
          cfg.pulse && "animate-pulse"
        )}
      />
      {cfg.label}
    </span>
  );
}
