"use client";

import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

interface ProjectTopbarProps {
  projectName: string;
  orgName?: string;
}

export function ProjectTopbar({ projectName, orgName }: ProjectTopbarProps) {
  const crumbs = [
    ...(orgName ? [{ label: orgName }] : []),
    { label: projectName },
  ];

  return (
    <DashboardTopbar
      breadcrumbs={crumbs}
      roleLabel="Project User"
    />
  );
}
