"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePlatformStore } from "@/store/platform";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  ChevronLeft,
  Users,
  Fingerprint,
  Shield,
  Activity,
} from "lucide-react";

export const memberNav = [
  { id: "identity", label: "My Identity", href: "/me", icon: LayoutDashboard },
  { id: "biometrics", label: "My Biometrics", href: "/me/biometrics", icon: Fingerprint },
  { id: "history", label: "Auth History", href: "/me/history", icon: Activity },
  { id: "access", label: "My Access", href: "/me/access", icon: Shield },
  { id: "security", label: "Security", href: "/me/security", icon: Shield },
  { id: "profile", label: "Profile", href: "/me/profile", icon: Users },
];

export function MemberSidebar() {
  const { sidebarCollapsed, toggleSidebar } = usePlatformStore();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/me") {
      return pathname === href || pathname === href + "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 60 : 224 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full shrink-0 flex-col border-r border-white/[0.065] bg-[#030303]"
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-white/[0.055] px-3",
          sidebarCollapsed ? "justify-center" : "justify-between gap-2"
        )}
      >
        {!sidebarCollapsed && (
          <div className="flex flex-col gap-0.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/newlogo.png"
              alt="NeoFace"
              style={{ height: "16px", width: "auto", objectFit: "contain", opacity: 0.85, display: "block" }}
            />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#00E5A8]/70">
              Member Portal
            </p>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 border border-[#00E5A8]/20">
            <Fingerprint className="h-3.5 w-3.5 text-[#00E5A8]" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/25 transition-all hover:bg-white/[0.06] hover:text-white/60",
            sidebarCollapsed && "rotate-180"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-2">
          {memberNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <div key={item.id} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    "nav-item",
                    active && "active",
                    sidebarCollapsed && "justify-center px-0"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="flex-1">{item.label}</span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </motion.aside>
  );
}
