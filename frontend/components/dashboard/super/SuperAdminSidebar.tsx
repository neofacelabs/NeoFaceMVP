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
  Building2,
  BarChart3,
  Brain,
  Server,
  HardDrive,
  CreditCard,
  FileText,
  Megaphone,
  Settings,
  ChevronLeft,
  Users,
  FolderKanban,
  ZapIcon,
  Layers,
  Shield,
  Zap,
  ScanFace,
  Key,
} from "lucide-react";

export const superAdminNav = [
  { id: "overview", label: "Overview", href: "/super", icon: LayoutDashboard, section: "PLATFORM" },
  { id: "organizations", label: "Organizations", href: "/super/organizations", icon: Building2, section: "PLATFORM" },
  { id: "projects", label: "Projects", href: "/super/projects", icon: FolderKanban, section: "PLATFORM" },
  { id: "identities", label: "Identities", href: "/super/identities", icon: Users, section: "PLATFORM" },
  { id: "credentials", label: "Credentials Control", href: "/super/credentials", icon: Key, section: "PLATFORM" },
  { id: "authentication", label: "Authentication", href: "/super/authentication", icon: ZapIcon, section: "OPERATIONS" },
  { id: "devices", label: "Devices", href: "/super/devices", icon: HardDrive, section: "OPERATIONS" },
  { id: "security", label: "Security Center", href: "/super/security", icon: Shield, section: "OPERATIONS" },
  { id: "trust-terminal", label: "Trust Terminal", href: "/super/trust-terminal", icon: ScanFace, badge: "LIVE", section: "OPERATIONS" },
  { id: "ai-models", label: "AI Engine", href: "/super/ai-models", icon: Brain, section: "OPERATIONS" },
  { id: "infrastructure", label: "Infrastructure", href: "/super/infrastructure", icon: Server, section: "OPERATIONS" },
  { id: "reports", label: "Reports", href: "/super/reports", icon: BarChart3, section: "BUSINESS" },
  { id: "billing", label: "Billing", href: "/super/billing", icon: CreditCard, section: "BUSINESS" },
  { id: "integrations", label: "API & Integrations", href: "/super/integrations", icon: Layers, section: "BUSINESS" },
  { id: "audit-logs", label: "Audit Logs", href: "/super/audit-logs", icon: FileText, section: "SYSTEM" },
  { id: "announcements", label: "Notifications", href: "/super/announcements", icon: Megaphone, section: "SYSTEM" },
  { id: "settings", label: "Settings", href: "/super/settings", icon: Settings, section: "SYSTEM" },
];

export function SuperAdminSidebar() {
  const { sidebarCollapsed, toggleSidebar } = usePlatformStore();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/super") {
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
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/newlogo.png"
              alt="NeoFace"
              style={{ height: "17px", width: "auto", objectFit: "contain", opacity: 0.88, display: "block", flexShrink: 0 }}
            />
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#00E5A8]/70 shrink-0">
              Super Admin
            </p>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 border border-[#00E5A8]/20">
            <Zap className="h-3.5 w-3.5 text-[#00E5A8]" />
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
          {(() => {
            let lastSection = "";
            return superAdminNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              const section = item.section;

              const showSectionHeader = section && section !== lastSection;
              if (showSectionHeader) {
                lastSection = section;
              }

              return (
                <div key={item.id} className="space-y-1">
                  {showSectionHeader && !sidebarCollapsed && (
                    <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      {section}
                    </div>
                  )}
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
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00E5A8]/15 px-1 text-[9px] font-bold text-[#00E5A8]">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </div>
              );
            });
          })()}
        </nav>
      </ScrollArea>
    </motion.aside>
  );
}
