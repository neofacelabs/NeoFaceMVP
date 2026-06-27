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
  Settings,
  ChevronLeft,
  Users,
  FolderKanban,
  Fingerprint,
  Shield,
  Map,
  Layers,
  HardDrive,
  BarChart3,
  ScanFace,
  Building2,
} from "lucide-react";

export function getOrgAdminNav(orgSlug: string) {
  const base = `/org/${orgSlug}`;
  return [
    { id: "overview", label: "Overview", href: base, icon: LayoutDashboard, section: "ORGANIZATION" },
    { id: "sites", label: "Sites", href: `${base}/sites`, icon: Map, section: "ORGANIZATION" },
    { id: "projects", label: "Projects", href: `${base}/projects`, icon: FolderKanban, section: "ORGANIZATION" },
    { id: "identities", label: "Identities", href: `${base}/identities`, icon: Users, section: "ORGANIZATION" },

    { id: "enrollment", label: "Enrollment", href: `${base}/enrollment`, icon: Fingerprint, section: "OPERATIONS" },
    { id: "trust-terminal", label: "Trust Terminal", href: `${base}/trust-terminal`, icon: ScanFace, badge: "LIVE", section: "OPERATIONS" },
    { id: "authentication", label: "Authentication", href: `${base}/authentication`, icon: Fingerprint, section: "OPERATIONS" },
    { id: "devices", label: "Devices", href: `${base}/devices`, icon: HardDrive, section: "OPERATIONS" },
    { id: "access-zones", label: "Access Zones", href: `${base}/access-zones`, icon: Map, section: "OPERATIONS" },

    { id: "reports", label: "Reports", href: `${base}/reports`, icon: BarChart3, section: "MANAGEMENT" },
    { id: "security", label: "Security", href: `${base}/security`, icon: Shield, section: "MANAGEMENT" },
    { id: "integrations", label: "API & Integrations", href: `${base}/integrations`, icon: Layers, section: "MANAGEMENT" },

    { id: "members", label: "Members & Roles", href: `${base}/members`, icon: Users, section: "ADMINISTRATION" },
    { id: "settings", label: "Settings", href: `${base}/settings`, icon: Settings, section: "ADMINISTRATION" },
  ];
}

interface OrgAdminSidebarProps {
  orgSlug: string;
  orgName: string;
}

export function OrgAdminSidebar({ orgSlug, orgName }: OrgAdminSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = usePlatformStore();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === `/org/${orgSlug}`) {
      return pathname === href || pathname === href + "/";
    }
    return pathname.startsWith(href);
  };

  const navItems = getOrgAdminNav(orgSlug);

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
            <p className="truncate text-[9px] font-semibold uppercase tracking-widest text-white/35">
              {orgName}
            </p>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.09]">
            <Building2 className="h-3.5 w-3.5 text-white/50" />
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
            return navItems.map((item) => {
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
