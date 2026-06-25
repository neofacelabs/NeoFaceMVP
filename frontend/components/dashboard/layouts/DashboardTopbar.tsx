"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Command, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { usePlatformStore } from "@/store/platform";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardTopbarProps {
  title?: string;
  roleLabel?: string;
  orgName?: string;
}

export function DashboardTopbar({ title, roleLabel, orgName }: DashboardTopbarProps) {
  const {
    openCommandPalette,
    notificationPanelOpen,
    toggleNotifications,
    notifications,
    markAllRead,
    markNotificationRead,
  } = usePlatformStore();
  const { user, logout } = useAuthStore();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.055] bg-[#030303]/80 px-4 backdrop-blur-sm">
        {/* Left: Title / Context */}
        <div className="flex items-center gap-3">
          {orgName && (
            <span className="text-[11px] font-medium text-white/30 hidden sm:block">
              {orgName}
            </span>
          )}
          {orgName && title && (
            <span className="text-white/15 hidden sm:block">/</span>
          )}
          {title && (
            <span className="text-[13px] font-semibold text-white/80">{title}</span>
          )}
          {roleLabel && !title && (
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/25">
              {roleLabel}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          {/* Search / Command */}
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

          {/* Notifications */}
          <button
            onClick={toggleNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#00E5A8] px-0.5 text-[8px] font-bold text-black">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5A8]/30 to-[#0EA5E9]/20 text-[10px] font-bold text-[#00E5A8]">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden text-[12px] font-medium sm:block max-w-[120px] truncate">
                  {user?.name ?? "User"}
                </span>
                <ChevronDown className="h-3 w-3 text-white/25" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-xl border border-white/[0.09] bg-[#0a0a0a] p-1 shadow-modal"
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <p className="text-xs font-semibold text-white">{user?.name ?? "User"}</p>
                <p className="text-[10.5px] text-white/35">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#f87171]/70 hover:bg-[#f87171]/[0.06] hover:text-[#f87171] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={toggleNotifications}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col border-l border-white/[0.08] bg-[#050505] shadow-modal"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] p-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                  {unread > 0 && (
                    <p className="text-[10.5px] text-white/35">{unread} unread</p>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#00E5A8]/70 hover:text-[#00E5A8] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {notifications.map((n) => {
                  const typeColors = {
                    alert: "bg-[#f87171]/[0.06] border-[#f87171]/20",
                    warning: "bg-[#fbbf24]/[0.04] border-[#fbbf24]/15",
                    success: "bg-[#00E5A8]/[0.04] border-[#00E5A8]/15",
                    info: "bg-[#0EA5E9]/[0.04] border-[#0EA5E9]/15",
                  };
                  const dotColors = {
                    alert: "bg-[#f87171]",
                    warning: "bg-[#fbbf24]",
                    success: "bg-[#00E5A8]",
                    info: "bg-[#38BDF8]",
                  };
                  return (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "w-full border-b border-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.025]",
                        !n.read && "bg-white/[0.015]"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotColors[n.type], !n.read && "shadow-[0_0_4px_currentColor]")} />
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-[12px] font-medium leading-snug", n.read ? "text-white/50" : "text-white/85")}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-white/30 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-white/20">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
