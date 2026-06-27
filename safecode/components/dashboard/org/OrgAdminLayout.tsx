"use client";

import React from "react";
import { OrgAdminSidebar } from "./OrgAdminSidebar";
import { OrgAdminTopbar } from "./OrgAdminTopbar";
import { CommandPalette } from "../CommandPalette";

interface OrgAdminLayoutProps {
  children: React.ReactNode;
  orgSlug: string;
  orgName: string;
}

export function OrgAdminLayout({ children, orgSlug, orgName }: OrgAdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <OrgAdminSidebar orgSlug={orgSlug} orgName={orgName} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <OrgAdminTopbar orgName={orgName} />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-5 md:p-6">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
