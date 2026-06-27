"use client";

import React, { useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { usePlatformStore } from "@/store/platform";
import {
  LayoutDashboard,
  Building2,
  Users,
  Fingerprint,
  BarChart3,
  Shield,
  Settings,
  HardDrive,
  Brain,
  FileText,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const commandItems = [
  { group: "Navigation", label: "Super Admin Overview", href: "/super", icon: LayoutDashboard },
  { group: "Navigation", label: "Organizations", href: "/super/organizations", icon: Building2 },
  { group: "Navigation", label: "AI Models", href: "/super/ai-models", icon: Brain },
  { group: "Navigation", label: "Infrastructure", href: "/super/infrastructure", icon: HardDrive },
  { group: "Navigation", label: "Audit Logs", href: "/super/audit-logs", icon: FileText },
  { group: "Navigation", label: "Analytics", href: "/super/analytics", icon: BarChart3 },
  { group: "Navigation", label: "Billing", href: "/super/billing", icon: BarChart3 },
  { group: "Project", label: "IIT Delhi Campus", href: "/org/iit-delhi/projects/edu-001", icon: LayoutDashboard },
  { group: "Project", label: "Acme HQ Security", href: "/org/acme-corp/projects/sec-001", icon: Shield },
  { group: "Actions", label: "Members", href: "/super/organizations", icon: Users },
  { group: "Actions", label: "Enrollment", href: "/org/iit-delhi/projects/edu-001/enrollment", icon: Fingerprint },
  { group: "Actions", label: "Settings", href: "/super/settings", icon: Settings },
];

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = usePlatformStore();
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        if (commandPaletteOpen) {
          closeCommandPalette();
        } else {
          usePlatformStore.getState().openCommandPalette();
        }
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        closeCommandPalette();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, closeCommandPalette]);

  const runCommand = useCallback(
    (href: string) => {
      closeCommandPalette();
      setSearch("");
      router.push(href);
    },
    [closeCommandPalette, router]
  );

  const groups = [...new Set(commandItems.map((i) => i.group))];
  const filtered = search
    ? commandItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : commandItems;

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20vh] z-[61] w-full max-w-[560px] -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a] shadow-modal">
              {/* Search input */}
              <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-white/30" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pages, members, actions..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
                <kbd className="flex items-center gap-0.5 rounded border border-white/[0.08] px-1.5 py-1 text-[9px] text-white/20">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-white/25">
                    No results for &ldquo;{search}&rdquo;
                  </div>
                ) : search ? (
                  <div className="px-2">
                    {filtered.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => runCommand(item.href)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                          <span className="ml-auto text-[10px] text-white/20">{item.group}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group}>
                      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/20">
                        {group}
                      </p>
                      <div className="px-2 pb-2">
                        {commandItems
                          .filter((i) => i.group === group)
                          .map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.href}
                                onClick={() => runCommand(item.href)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05]">
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2">
                <p className="text-[10px] text-white/20">
                  <kbd className="rounded border border-white/[0.08] px-1 py-0.5 text-[9px]">↵</kbd>{" "}
                  to select
                </p>
                <p className="text-[10px] text-white/20">NeoFace Command Center</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
