"use client";

import React from "react";
import { SuperAdminLayout } from "@/components/dashboard/super/SuperAdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
