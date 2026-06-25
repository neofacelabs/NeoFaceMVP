"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/layouts/DashboardLayout";
import { getOrgAdminNav } from "@/components/dashboard/layouts/DashboardSidebar";
import { Building2 } from "lucide-react";
import { mockOrganizations } from "@/lib/mock-data/super-admin";

export default function OrgAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = React.use(params);
  const org = mockOrganizations.find((o) => o.slug === orgSlug) ?? {
    name: orgSlug,
    slug: orgSlug,
    industry: "",
    plan: "pro" as const,
  };

  const navItems = getOrgAdminNav(orgSlug);

  const SidebarHeader = () => (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.09]">
        <Building2 className="h-3.5 w-3.5 text-white/50" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-bold text-white">{org.name}</p>
        <p className="text-[9.5px] font-medium uppercase tracking-wider text-white/30">
          Organization Admin
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navItems={navItems}
      sidebarHeader={<SidebarHeader />}
      topbarOrgName={org.name}
    >
      {children}
    </DashboardLayout>
  );
}
