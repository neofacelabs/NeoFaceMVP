"use client";

import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export function SuperAdminTopbar() {
  return (
    <DashboardTopbar
      breadcrumbs={[
        { label: "Control Center" },
      ]}
      statusBadge="All Systems Operational"
      statusColor="green"
      roleLabel="Super Admin"
    />
  );
}
