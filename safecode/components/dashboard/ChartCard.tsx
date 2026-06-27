"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  index?: number;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
  contentClassName,
  index = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5",
        className
      )}
    >
      {/* Top shine line */}
      <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/08 to-transparent" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[11.5px] text-white/35">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className={cn("w-full", contentClassName)}>{children}</div>
    </motion.div>
  );
}
