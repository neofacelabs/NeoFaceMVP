"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { usePlatformStore } from "@/store/platform";
import { useAuthStore } from "@/store/auth";
import { firebaseLogout } from "@/lib/firebase-auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface DashboardTopbarProps {
  breadcrumbs?: BreadcrumbSegment[];
  statusBadge?: string;
  statusColor?: "green" | "amber" | "red";
  roleLabel?: string;
}

export function DashboardTopbar({
  breadcrumbs = [],
  statusBadge,
  statusColor = "green",
  roleLabel = "Admin",
}: DashboardTopbarProps) {
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

  const dotColor =
    statusColor === "green"
      ? "#00E5A8"
      : statusColor === "amber"
      ? "#FBBF24"
      : "#F87171";

  return (
    <header
      style={{
        display: "flex",
        height: "56px",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "16px",
        paddingRight: "16px",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        background: "rgba(3,3,3,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        gap: "12px",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* ── LEFT: breadcrumbs only — logo now lives in sidebar header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
        {/* Breadcrumb trail */}
        {breadcrumbs.length > 0 && (
          <nav style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
            {breadcrumbs.map((seg, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <ChevronRight
                    style={{ width: "12px", height: "12px", color: "rgba(255,255,255,0.18)", flexShrink: 0 }}
                  />
                )}
                {seg.href ? (
                  <Link
                    href={seg.href}
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: i === breadcrumbs.length - 1 ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.30)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "140px",
                    }}
                  >
                    {seg.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: i === breadcrumbs.length - 1 ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.30)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "160px",
                    }}
                  >
                    {seg.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* ── RIGHT: Status + Search + Bell + User ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

        {/* Status badge */}
        {statusBadge && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.03)",
              padding: "5px 12px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: dotColor,
                flexShrink: 0,
                boxShadow: `0 0 6px ${dotColor}80`,
              }}
            />
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {statusBadge}
            </span>
          </div>
        )}

        {/* Search */}
        <button
          onClick={openCommandPalette}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            padding: "5px 12px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.35)",
            fontSize: "11.5px",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
          }}
        >
          <Search style={{ width: "13px", height: "13px", flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap" }}>Search...</span>
          <kbd
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              borderRadius: "4px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              padding: "1px 5px",
              fontSize: "9px",
              color: "rgba(255,255,255,0.20)",
              letterSpacing: "0.02em",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Bell */}
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.30)",
            transition: "border-color 0.15s, background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "rgba(255,255,255,0.12)";
            el.style.background = "rgba(255,255,255,0.05)";
            el.style.color = "rgba(255,255,255,0.60)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = "rgba(255,255,255,0.07)";
            el.style.background = "rgba(255,255,255,0.02)";
            el.style.color = "rgba(255,255,255,0.30)";
          }}
        >
          <Bell style={{ width: "13px", height: "13px" }} />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.025)",
                paddingLeft: "4px",
                paddingRight: "10px",
                paddingTop: "4px",
                paddingBottom: "4px",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(0,229,168,0.25) 0%, rgba(14,165,233,0.18) 100%)",
                  border: "1px solid rgba(0,229,168,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#00E5A8",
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.65)",
                  maxWidth: "90px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Admin"}
              </span>
              <ChevronDown style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 border-white/[0.08] bg-[#0a0a0a] text-white"
          >
            <div className="px-3 py-2.5 border-b border-white/[0.06]">
              <p className="text-[12px] font-semibold text-white/80 truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-white/35 mt-0.5 truncate">
                {user?.email || roleLabel}
              </p>
            </div>
            <div className="py-1">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-[12px] text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer mx-1 rounded-md"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
