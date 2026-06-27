"use client";

import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

interface OrgAdminTopbarProps {
  orgName: string;
}

export function OrgAdminTopbar({ orgName }: OrgAdminTopbarProps) {
  return (
    <DashboardTopbar
      breadcrumbs={[{ label: orgName }]}
      roleLabel="Org Admin"
    />
  );
}
