"use client";

import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { usePlatformStore } from "@/store/platform";
import { useAuthStore } from "@/store/auth";
import { firebaseLogout } from "@/lib/firebase-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SuperAdminTopbar() {
  const { openCommandPalette } = usePlatformStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error("Firebase logout error:", err);
    }
    logout();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.055] bg-[#030303]/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-white/25">
          Platform Control Center
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] text-white/30 transition-colors hover:border-white/10 hover:text-white/50 hover:bg-white/[0.05]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:block">Search...</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-white/[0.08] px-1 py-0.5 text-[9px] text-white/20 sm:flex">
            <span>⌘</span>K
          </kbd>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1 pr-2 transition-all hover:bg-white/[0.05]">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00E5A8]/10 text-xs font-bold text-[#00E5A8]">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="text-left text-[11.5px] font-medium text-white/70 hidden sm:block">
                {user?.name || "Super Admin"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-white/[0.08] bg-[#0c0c0c] text-white">
            <DropdownMenuLabel className="text-[10px] font-semibold text-white/30 uppercase">
              Platform Admin
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
