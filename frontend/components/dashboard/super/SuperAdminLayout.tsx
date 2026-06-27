"use client";

import React from "react";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { SuperAdminTopbar } from "./SuperAdminTopbar";
import { CommandPalette } from "../CommandPalette";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <SuperAdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SuperAdminTopbar />
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
