"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DashboardSidebar, type SidebarNavItem } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { CommandPalette } from "../CommandPalette";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: SidebarNavItem[];
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topbarTitle?: string;
  topbarRoleLabel?: string;
  topbarOrgName?: string;
  className?: string;
}

export function DashboardLayout({
  children,
  navItems,
  sidebarHeader,
  sidebarFooter,
  topbarTitle,
  topbarRoleLabel,
  topbarOrgName,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Sidebar */}
      <DashboardSidebar
        navItems={navItems}
        header={sidebarHeader}
        footer={sidebarFooter}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar
          title={topbarTitle}
          roleLabel={topbarRoleLabel}
          orgName={topbarOrgName}
        />

        {/* Scrollable content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            className
          )}
        >
          <div className="min-h-full p-5 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global command palette */}
      <CommandPalette />
    </div>
  );
}
