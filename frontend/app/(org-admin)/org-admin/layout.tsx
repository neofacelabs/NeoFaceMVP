"use client";

import React from "react";
import { OrgAdminLayout } from "@/components/dashboard/org/OrgAdminLayout";
import { usePlatformStore } from "@/store/platform";
import { usePathname } from "next/navigation";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentOrg = usePlatformStore((s) => s.currentOrg);

  const orgName = currentOrg?.name || "NeoFace Default";
  const orgSlug = currentOrg?.slug || "neoface-default";

  const isProjectPage = pathname.split("/").includes("projects") && !pathname.endsWith("/projects/new");

  if (isProjectPage) {
    return <>{children}</>;
  }

  return (
    <OrgAdminLayout orgSlug={orgSlug} orgName={orgName}>
      {children}
    </OrgAdminLayout>
  );
}
