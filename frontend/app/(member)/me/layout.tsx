"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/layouts/DashboardLayout";
import { getMemberNav } from "@/components/dashboard/layouts/DashboardSidebar";
import { Fingerprint } from "lucide-react";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const navItems = getMemberNav();

  const SidebarHeader = () => (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 border border-[#00E5A8]/20">
        <Fingerprint className="h-3.5 w-3.5 text-[#00E5A8]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-bold text-white">My Identity</p>
        <p className="text-[9.5px] font-medium uppercase tracking-wider text-[#00E5A8]/60">
          Member Portal
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navItems={navItems}
      sidebarHeader={<SidebarHeader />}
      topbarRoleLabel="Member Portal"
    >
      {children}
    </DashboardLayout>
  );
}
