"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPIStat } from "@/types/platform";

interface KPICardProps extends KPIStat {
  index?: number;
  className?: string;
  onClick?: () => void;
}

const colorMap = {
  default: {
    value: "text-white",
    bg: "bg-white/[0.025]",
    border: "border-white/[0.065]",
    icon: "text-white/30",
    trend_up: "text-[#00E5A8]",
    trend_down: "text-[#f87171]",
  },
  success: {
    value: "text-[#00E5A8]",
    bg: "bg-[#00E5A8]/[0.04]",
    border: "border-[#00E5A8]/[0.15]",
    icon: "text-[#00E5A8]/50",
    trend_up: "text-[#00E5A8]",
    trend_down: "text-[#f87171]",
  },
  warning: {
    value: "text-[#fbbf24]",
    bg: "bg-[#fbbf24]/[0.04]",
    border: "border-[#fbbf24]/[0.15]",
    icon: "text-[#fbbf24]/50",
    trend_up: "text-[#00E5A8]",
    trend_down: "text-[#f87171]",
  },
  error: {
    value: "text-[#f87171]",
    bg: "bg-[#f87171]/[0.04]",
    border: "border-[#f87171]/[0.15]",
    icon: "text-[#f87171]/50",
    trend_up: "text-[#00E5A8]",
    trend_down: "text-[#f87171]",
  },
  accent: {
    value: "text-[#38BDF8]",
    bg: "bg-[#0EA5E9]/[0.04]",
    border: "border-[#0EA5E9]/[0.15]",
    icon: "text-[#38BDF8]/50",
    trend_up: "text-[#00E5A8]",
    trend_down: "text-[#f87171]",
  },
};

export function KPICard({
  label,
  value,
  unit,
  trend,
  trend_direction,
  sub_label,
  color = "default",
  index = 0,
  className,
  onClick,
}: KPICardProps) {
  const colors = colorMap[color];
  const TrendIcon =
    trend_direction === "up"
      ? TrendingUp
      : trend_direction === "down"
      ? TrendingDown
      : Minus;
  const trendColor =
    trend_direction === "up"
      ? colors.trend_up
      : trend_direction === "down"
      ? colors.trend_down
      : "text-white/30";

  const formattedValue =
    typeof value === "number"
      ? value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M`
        : value >= 1_000
        ? `${(value / 1_000).toFixed(1)}K`
        : value.toLocaleString()
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[14px] border p-5 transition-all duration-200",
        colors.bg,
        colors.border,
        onClick && "cursor-pointer hover:border-white/10 hover:shadow-card",
        className
      )}
    >
      {/* Top shine */}
      <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="kpi-label mb-3 truncate">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-[32px] font-bold leading-none tracking-tight",
                colors.value
              )}
            >
              {formattedValue}
            </span>
            {unit && (
              <span className="text-sm font-medium text-white/30">{unit}</span>
            )}
          </div>
          {sub_label && (
            <p className="mt-1.5 text-[11px] text-white/30">{sub_label}</p>
          )}
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
              trend_direction === "up" && "bg-[#00E5A8]/10",
              trend_direction === "down" && "bg-[#f87171]/10",
              trend_direction === "neutral" && "bg-white/5",
              trendColor
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Grid wrapper for a row of KPI cards
export function KPIGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        columns === 5 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
}
