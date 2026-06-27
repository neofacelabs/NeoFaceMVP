"use client";

import React from "react";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectTopbar } from "./ProjectTopbar";
import { CommandPalette } from "../CommandPalette";

interface ProjectLayoutProps {
  children: React.ReactNode;
  orgSlug: string;
  projectId: string;
  projectName: string;
  orgName?: string;
  template: "education" | "physical_security";
}

export function ProjectLayout({
  children,
  orgSlug,
  projectId,
  projectName,
  orgName,
  template,
}: ProjectLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      <ProjectSidebar
        orgSlug={orgSlug}
        projectId={projectId}
        projectName={projectName}
        template={template}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ProjectTopbar projectName={projectName} orgName={orgName} />
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
