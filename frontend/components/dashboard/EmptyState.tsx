"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { InboxIcon, SearchX, WifiOff, ShieldOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "empty" | "no-results" | "offline" | "no-access" | "no-members";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  defaultDescription: string;
  iconColor: string;
  bgColor: string;
}> = {
  empty: {
    icon: InboxIcon,
    defaultTitle: "Nothing here yet",
    defaultDescription: "Get started by creating your first item.",
    iconColor: "text-white/25",
    bgColor: "bg-white/[0.04]",
  },
  "no-results": {
    icon: SearchX,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search or filters.",
    iconColor: "text-white/25",
    bgColor: "bg-white/[0.04]",
  },
  offline: {
    icon: WifiOff,
    defaultTitle: "Device offline",
    defaultDescription: "This device has lost its connection. Check network settings.",
    iconColor: "text-[#f87171]/60",
    bgColor: "bg-[#f87171]/[0.06]",
  },
  "no-access": {
    icon: ShieldOff,
    defaultTitle: "Access restricted",
    defaultDescription: "You don't have permission to view this content.",
    iconColor: "text-[#fbbf24]/60",
    bgColor: "bg-[#fbbf24]/[0.06]",
  },
  "no-members": {
    icon: Users,
    defaultTitle: "No members yet",
    defaultDescription: "Start by adding members or importing from a CSV file.",
    iconColor: "text-[#00E5A8]/60",
    bgColor: "bg-[#00E5A8]/[0.05]",
  },
};

export function EmptyState({
  variant = "empty",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-2xl", config.bgColor)}>
        <Icon className={cn("h-7 w-7", config.iconColor)} />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-white/70">
        {title ?? config.defaultTitle}
      </h3>
      <p className="mb-5 max-w-xs text-xs text-white/30 leading-relaxed">
        {description ?? config.defaultDescription}
      </p>
      {action && (
        <Button
          size="sm"
          onClick={action.onClick}
          className="h-8 px-4 text-xs font-medium"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
