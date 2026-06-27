"use client";

import React from "react";
import { OrgAdminLayout } from "@/components/dashboard/org/OrgAdminLayout";
import { mockOrganizations } from "@/lib/mock-data/super-admin";
import { usePathname } from "next/navigation";

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = React.use(params);
  const pathname = usePathname();

  const org = mockOrganizations.find((o) => o.slug === orgSlug) ?? {
    name: orgSlug.replace("-", " ").toUpperCase(),
    slug: orgSlug,
    industry: "",
    plan: "pro" as const,
  };

  const isProjectPage = pathname.split("/").includes("projects") && !pathname.endsWith("/projects/new");

  if (isProjectPage) {
    return <>{children}</>;
  }

  return (
    <OrgAdminLayout orgSlug={orgSlug} orgName={org.name}>
      {children}
    </OrgAdminLayout>
  );
}
