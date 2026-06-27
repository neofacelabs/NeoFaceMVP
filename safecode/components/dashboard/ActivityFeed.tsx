"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ActivityFeedItem, ActivityType } from "@/types/platform";
import {
  UserCheck,
  Camera,
  AlertTriangle,
  WifiOff,
  Wifi,
  Shield,
  UserPlus,
  UserX,
  FolderPlus,
  Building2,
  Settings,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const iconMap: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  member_enrolled: UserCheck,
  face_updated: Camera,
  auth_success: CheckCircle2,
  auth_failed: XCircle,
  device_offline: WifiOff,
  device_online: Wifi,
  incident_raised: AlertTriangle,
  member_added: UserPlus,
  member_suspended: UserX,
  project_created: FolderPlus,
  org_created: Building2,
  policy_changed: Settings,
};

const severityColors = {
  info: { dot: "bg-[#38BDF8]", glow: "shadow-[0_0_6px_#38BDF8]", bg: "bg-[#0EA5E9]/8", icon: "text-[#38BDF8]" },
  success: { dot: "bg-[#00E5A8]", glow: "shadow-[0_0_6px_#00E5A8]", bg: "bg-[#00E5A8]/8", icon: "text-[#00E5A8]" },
  warning: { dot: "bg-[#fbbf24]", glow: "shadow-[0_0_6px_#fbbf24]", bg: "bg-[#fbbf24]/8", icon: "text-[#fbbf24]" },
  error: { dot: "bg-[#f87171]", glow: "shadow-[0_0_6px_#f87171]", bg: "bg-[#f87171]/8", icon: "text-[#f87171]" },
};

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, className, maxItems = 8 }: ActivityFeedProps) {
  const displayed = items.slice(0, maxItems);

  return (
    <div className={cn("space-y-0", className)}>
      {displayed.map((item, i) => {
        const Icon = iconMap[item.type] ?? Shield;
        const sev = severityColors[item.severity ?? "info"];
        const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-0 hover:bg-white/[0.015] -mx-1 px-1 rounded-md transition-colors"
          >
            {/* Icon badge */}
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                sev.bg
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", sev.icon)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-white/80 leading-snug">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-0.5 text-[11px] text-white/35 leading-relaxed line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot, sev.glow)} />
              <span className="text-[10.5px] text-white/25 whitespace-nowrap">{timeAgo}</span>
            </div>
          </motion.div>
        );
      })}

      {items.length === 0 && (
        <div className="py-8 text-center text-xs text-white/25">No recent activity</div>
      )}
    </div>
  );
}
