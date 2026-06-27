"use client";

import React from "react";
import { MemberSidebar } from "./MemberSidebar";
import { MemberTopbar } from "./MemberTopbar";
import { CommandPalette } from "../CommandPalette";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <MemberSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MemberTopbar />
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
