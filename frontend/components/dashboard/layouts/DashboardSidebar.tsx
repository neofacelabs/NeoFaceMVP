"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Users,
  FolderKanban,
  Fingerprint,
  Shield,
  Activity,
  AlertTriangle,
  Map,
  UserCheck,
  BookOpen,
  Layers,
  Cctv,
  ZapIcon,
  ExternalLink,
  ScanFace,
  LucideIcon,
} from "lucide-react";

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  children?: Omit<SidebarNavItem, "children">[];
}

interface DashboardSidebarProps {
  navItems: SidebarNavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  orgSlug?: string;
}

export function DashboardSidebar({ navItems, header, footer, orgSlug }: DashboardSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = usePlatformStore();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => {
    if (href === "/" || href.endsWith("/dashboard")) {
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
      {/* Top header area */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-white/[0.055] px-3",
          sidebarCollapsed ? "justify-center" : "justify-between gap-2"
        )}
      >
        {!sidebarCollapsed && header}

        {/* Collapse toggle */}
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

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const expanded = expandedItems.includes(item.id);
            const Icon = item.icon;

            return (
              <div key={item.id}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={cn(
                      "nav-item w-full",
                      active && "active",
                      sidebarCollapsed && "justify-center px-0"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 text-white/20 transition-transform",
                            expanded && "rotate-90"
                          )}
                        />
                      </>
                    )}
                  </button>
                ) : (
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
                )}

                {/* Children */}
                <AnimatePresence>
                  {hasChildren && expanded && !sidebarCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-5 mt-0.5 space-y-0.5"
                    >
                      {item.children!.map((child) => {
                        const childActive = isActive(child.href);
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={cn(
                              "nav-item",
                              childActive && "active"
                            )}
                          >
                            <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {footer && !sidebarCollapsed && (
        <div className="border-t border-white/[0.055] p-3">{footer}</div>
      )}
    </motion.aside>
  );
}

// ── Pre-built nav configs ──────────────────────────────────────────────────────

export const superAdminNav: SidebarNavItem[] = [
  { id: "overview", label: "Overview", href: "/super", icon: LayoutDashboard },
  { id: "trust-terminal", label: "Trust Terminal", href: "/super/trust-terminal", icon: ScanFace, badge: "LIVE" },
  { id: "organizations", label: "Organizations", href: "/super/organizations", icon: Building2 },
  { id: "analytics", label: "Analytics", href: "/super/analytics", icon: BarChart3 },
  { id: "ai-models", label: "AI Models", href: "/super/ai-models", icon: Brain },
  { id: "infrastructure", label: "Infrastructure", href: "/super/infrastructure", icon: Server },
  { id: "devices", label: "All Devices", href: "/super/devices", icon: HardDrive },
  { id: "billing", label: "Billing", href: "/super/billing", icon: CreditCard },
  { id: "audit-logs", label: "Audit Logs", href: "/super/audit-logs", icon: FileText },
  { id: "announcements", label: "Announcements", href: "/super/announcements", icon: Megaphone },
  { id: "settings", label: "Settings", href: "/super/settings", icon: Settings },
];

export function getOrgAdminNav(orgSlug: string): SidebarNavItem[] {
  const base = `/org/${orgSlug}`;
  return [
    { id: "overview", label: "Overview", href: base, icon: LayoutDashboard },
    { id: "trust-terminal", label: "Trust Terminal", href: `${base}/trust-terminal`, icon: ScanFace, badge: "LIVE" },
    { id: "projects", label: "Projects", href: `${base}/projects`, icon: FolderKanban },
    { id: "members", label: "Members", href: `${base}/members`, icon: Users },
    { id: "devices", label: "Devices", href: `${base}/devices`, icon: HardDrive },
    { id: "reports", label: "Reports", href: `${base}/reports`, icon: BarChart3 },
    { id: "security", label: "Security", href: `${base}/security`, icon: Shield },
    { id: "settings", label: "Settings", href: `${base}/settings`, icon: Settings },
  ];
}

export function getEducationNav(orgSlug: string, projectId: string): SidebarNavItem[] {
  const base = `/org/${orgSlug}/projects/${projectId}`;
  return [
    { id: "dashboard", label: "Dashboard", href: base, icon: LayoutDashboard },
    { id: "trust-terminal", label: "Trust Terminal", href: `/org/${orgSlug}/trust-terminal`, icon: ScanFace, badge: "LIVE" },
    {
      id: "members",
      label: "Members",
      href: `${base}/members`,
      icon: Users,
      children: [
        { id: "students", label: "Students", href: `${base}/members/students`, icon: Users },
        { id: "faculty", label: "Faculty", href: `${base}/members/faculty`, icon: BookOpen },
        { id: "staff", label: "Staff", href: `${base}/members/staff`, icon: UserCheck },
        { id: "visitors", label: "Visitors", href: `${base}/members/visitors`, icon: ExternalLink },
      ],
    },
    { id: "enrollment", label: "Enrollment", href: `${base}/enrollment`, icon: Fingerprint },
    { id: "authentication", label: "Authentication", href: `${base}/authentication`, icon: ZapIcon },
    { id: "departments", label: "Departments", href: `${base}/departments`, icon: Layers },
    { id: "classes", label: "Classes", href: `${base}/classes`, icon: BookOpen },
    { id: "devices", label: "Devices", href: `${base}/devices`, icon: Cctv },
    { id: "reports", label: "Reports", href: `${base}/reports`, icon: BarChart3 },
    { id: "security", label: "Security", href: `${base}/security`, icon: Shield },
    { id: "settings", label: "Settings", href: `${base}/settings`, icon: Settings },
  ];
}

export function getPhysicalSecurityNav(orgSlug: string, projectId: string): SidebarNavItem[] {
  const base = `/org/${orgSlug}/projects/${projectId}`;
  return [
    { id: "dashboard", label: "Dashboard", href: base, icon: LayoutDashboard },
    { id: "trust-terminal", label: "Trust Terminal", href: `/org/${orgSlug}/trust-terminal`, icon: ScanFace, badge: "LIVE" },
    { id: "personnel", label: "Personnel", href: `${base}/personnel`, icon: Users },
    { id: "access-zones", label: "Access Zones", href: `${base}/access-zones`, icon: Map },
    { id: "devices", label: "Devices", href: `${base}/devices`, icon: Cctv },
    { id: "authentication", label: "Authentication", href: `${base}/authentication`, icon: ZapIcon },
    { id: "visitors", label: "Visitor Mgmt", href: `${base}/visitor-management`, icon: UserCheck },
    { id: "incidents", label: "Incidents", href: `${base}/incidents`, icon: AlertTriangle },
    { id: "reports", label: "Reports", href: `${base}/reports`, icon: BarChart3 },
    { id: "security-policies", label: "Security Policies", href: `${base}/security-policies`, icon: Shield },
    { id: "settings", label: "Settings", href: `${base}/settings`, icon: Settings },
  ];
}

export function getMemberNav(): SidebarNavItem[] {
  return [
    { id: "identity", label: "My Identity", href: "/me", icon: LayoutDashboard },
    { id: "biometrics", label: "My Biometrics", href: "/me/biometrics", icon: Fingerprint },
    { id: "history", label: "Auth History", href: "/me/history", icon: Activity },
    { id: "access", label: "My Access", href: "/me/access", icon: Shield },
    { id: "security", label: "Security", href: "/me/security", icon: Shield },
    { id: "profile", label: "Profile", href: "/me/profile", icon: Users },
  ];
}
