"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/layouts/DashboardLayout";
import { getEducationNav, getPhysicalSecurityNav } from "@/components/dashboard/layouts/DashboardSidebar";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { mockOrganizations } from "@/lib/mock-data/super-admin";

function getTemplate(projectId: string) {
  if (projectId.startsWith("edu-")) return "education";
  return "physical_security";
}

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = React.use(params);
  const org = mockOrganizations.find((o) => o.slug === orgSlug);
  const template = getTemplate(projectId);
  const isEducation = template === "education";
  const projectName = isEducation ? "IIT Delhi Campus" : "Acme HQ Security";

  const navItems = isEducation
    ? getEducationNav(orgSlug, projectId)
    : getPhysicalSecurityNav(orgSlug, projectId);

  const SidebarHeader = () => (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
          isEducation
            ? "bg-[#00E5A8]/[0.07] border-[#00E5A8]/20"
            : "bg-[#0EA5E9]/[0.07] border-[#0EA5E9]/20"
        }`}
      >
        {isEducation ? (
          <GraduationCap className="h-3.5 w-3.5 text-[#00E5A8]" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11.5px] font-bold text-white">{projectName}</p>
        <p className={`text-[9px] font-medium uppercase tracking-wider ${isEducation ? "text-[#00E5A8]/60" : "text-[#38BDF8]/60"}`}>
          {isEducation ? "Education" : "Physical Security"}
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      navItems={navItems}
      sidebarHeader={<SidebarHeader />}
      topbarOrgName={org?.name}
      topbarTitle={projectName}
    >
      {children}
    </DashboardLayout>
  );
}
