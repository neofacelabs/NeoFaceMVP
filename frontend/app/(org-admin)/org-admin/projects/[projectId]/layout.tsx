"use client";

import React from "react";
import { ProjectLayout as DashboardProjectLayout } from "@/components/dashboard/project/ProjectLayout";
import { usePlatformStore } from '@/store/platform';
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
  params: Promise<{ projectId: string }>;
}) {
  const orgSlug = usePlatformStore((s) => s.currentOrg?.slug || "neoface-default");
  const { projectId } = React.use(params);
  const org = mockOrganizations.find((o) => o.slug === orgSlug);
  const template = getTemplate(projectId);
  const isEducation = template === "education";
  const projectName = isEducation ? "IIT Delhi Campus" : "Acme HQ Security";

  return (
    <DashboardProjectLayout
      orgSlug={orgSlug}
      projectId={projectId}
      projectName={projectName}
      orgName={org?.name}
      template={template}
    >
      {children}
    </DashboardProjectLayout>
  );
}
