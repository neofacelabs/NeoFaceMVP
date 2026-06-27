"use client";

import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export function MemberTopbar() {
  return (
    <DashboardTopbar
      breadcrumbs={[{ label: "Member Portal" }]}
      roleLabel="Member"
    />
  );
}
