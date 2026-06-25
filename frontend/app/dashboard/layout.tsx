"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, Key, Users, Activity,
  BarChart3, Webhook, BookOpen, Settings,
  LogOut, Fingerprint, ShieldCheck, Eye, Brain,
  Zap, Server, Lock, Menu, X, Bell,
  Scan, Cpu, Shield, Globe, Terminal,
  ChevronRight, Clock, Code2, Building2,
  ShieldAlert, CreditCard, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useRole } from "@/hooks/use-role";
import { authApi, apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { firebaseLogout } from "@/lib/firebase-auth";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOMER NAV — restructured as AaaS platform
   ═══════════════════════════════════════════════════════════════════════════ */
const CUSTOMER_NAV = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
    ],
  },
  {
    section: "Identity APIs",
    items: [
      { href: "/dashboard/face-recognition", icon: Scan, label: "Face Recognition" },
      { href: "/dashboard/fingerprint", icon: Fingerprint, label: "Fingerprint" },
      { href: "/dashboard/trust-engine", icon: Shield, label: "Trust Engine" },
    ],
  },
  {
    section: "Build",
    items: [
      { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
      { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
      { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
    ],
  },
  {
    section: "Observe",
    items: [
      { href: "/dashboard/logs", icon: Activity, label: "Auth Logs" },
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/dashboard/sessions", icon: Lock, label: "Sessions" },
    ],
  },
  {
    section: "Developer",
    items: [
      { href: "/dashboard/sdk-playground", icon: Terminal, label: "SDK Playground" },
      { href: "/dashboard/documentation", icon: BookOpen, label: "Documentation" },
    ],
  },
  {
    section: "Coming Soon",
    items: [
      { href: "/dashboard/coming-soon/voice-auth", icon: Zap, label: "Voice Auth", comingSoon: true },
      { href: "/dashboard/coming-soon/iris-recognition", icon: Eye, label: "Iris Recognition", comingSoon: true },
      { href: "/dashboard/coming-soon/adaptive-mfa", icon: Brain, label: "Adaptive MFA", comingSoon: true },
      { href: "/dashboard/coming-soon/enterprise-sso", icon: Globe, label: "Enterprise SSO", comingSoon: true },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      { href: "/dashboard/coming-soon/billing", icon: CreditCard, label: "Billing", comingSoon: true },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN NAV
   ═══════════════════════════════════════════════════════════════════════════ */
const ADMIN_NAV = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Command Center", exact: true },
    ],
  },
  {
    section: "Platform",
    items: [
      { href: "/dashboard/users", icon: Users, label: "User Management" },
      { href: "/dashboard/projects", icon: FolderOpen, label: "Applications" },
      { href: "/dashboard/identity", icon: Layers, label: "Identity Storage" },
    ],
  },
  {
    section: "APIs",
    items: [
      { href: "/dashboard/face-recognition", icon: Scan, label: "Face Recognition" },
      { href: "/dashboard/fingerprint", icon: Fingerprint, label: "Fingerprint (WebAuthn)" },
      { href: "/dashboard/liveness", icon: Eye, label: "Liveness Detection" },
      { href: "/dashboard/trust-engine", icon: Shield, label: "Trust Engine" },
    ],
  },
  {
    section: "Monitoring",
    items: [
      { href: "/dashboard/analytics", icon: BarChart3, label: "API Monitoring" },
      { href: "/dashboard/risk", icon: ShieldAlert, label: "Fraud Center" },
      { href: "/dashboard/models", icon: Brain, label: "Model Monitoring" },
      { href: "/dashboard/logs", icon: Activity, label: "Audit Logs" },
    ],
  },
  {
    section: "Operations",
    items: [
      { href: "/dashboard/infrastructure", icon: Server, label: "Infrastructure" },
      { href: "/dashboard/sdk-playground", icon: Terminal, label: "SDK Playground" },
      { href: "/dashboard/documentation", icon: BookOpen, label: "Documentation" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   NAV ITEM
   ═══════════════════════════════════════════════════════════════════════════ */
function NavItem({
  href, icon: Icon, label, active, comingSoon,
}: {
  href: string; icon: any; label: string; active: boolean; comingSoon?: boolean;
}) {
  return (
    <Link href={href} className={cn("nav-item", active && "active", comingSoon && "opacity-60")}>
      <span
        className="w-[18px] h-[18px] flex items-center justify-center shrink-0"
        style={{ color: active ? "#00C2FF" : comingSoon ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.35)" }}
      >
        <Icon size={13} />
      </span>
      <span className="truncate flex-1">{label}</span>
      {active && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: "#00C2FF", boxShadow: "0 0 5px #00C2FF" }}
        />
      )}
      {comingSoon && !active && (
        <span className="ml-auto text-[8px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full shrink-0"
          style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.15)" }}>
          Soon
        </span>
      )}
    </Link>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <p className="px-2.5 pt-5 pb-1 text-[9.5px] font-semibold tracking-[0.12em] uppercase text-[rgba(255,255,255,0.2)]">
      {label}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD LAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isAdmin } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  /* ── Hydration guard ─────────────────────────────────────────────────── */
  useEffect(() => {
    if ((useAuthStore as any).persist?.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = (useAuthStore as any).persist?.onFinishHydration(() => setHydrated(true));
      return () => unsub?.();
    }
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push("/login");
  }, [hydrated, isAuthenticated, router]);

  /* ── Live clock ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    try { await firebaseLogout(); } catch {}
    logout();
    toast.success("Signed out");
    router.push("/");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));

  const nav = isAdmin ? ADMIN_NAV : CUSTOMER_NAV;

  const { data: notifsData } = useQuery<{ items: any[] }>({
    queryKey: ["header-notifications"],
    queryFn: () => apiClient.get("audit-logs?page=1&page_size=5").then(r => r.data),
    refetchInterval: 15_000,
    retry: false,
  });

  const realNotifs = (notifsData?.items ?? []).map((item: any) => {
    let type = "info";
    const event = item.event_type || "";
    let title = event.replace(/\./g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    if (event.includes("failed") || event.includes("error")) {
      type = "error";
    } else if (event.includes("passed") || event.includes("verified") || event.includes("enrolled")) {
      type = "success";
    } else if (event.includes("warn") || event.includes("rotated") || event.includes("revoked")) {
      type = "warning";
    }

    const diffMs = Date.now() - new Date(item.created_at).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    let timeStr = "Just now";
    if (diffDays > 0) timeStr = `${diffDays}d ago`;
    else if (diffHrs > 0) timeStr = `${diffHrs}h ago`;
    else if (diffMins > 0) timeStr = `${diffMins}m ago`;

    return {
      id: item.id,
      type,
      title,
      desc: item.actor_id ? `User: ${item.actor_id.slice(0, 8)}...` : "System operation",
      time: timeStr
    };
  });

  const MOCK_NOTIFS = realNotifs.length > 0 ? realNotifs : [
    { id: 1, type: "success", title: "Enrollment Complete", desc: "user_8f3a enrolled successfully", time: "2m ago" },
    { id: 2, type: "warning", title: "Risk Alert", desc: "Suspicious activity from 192.168.1.1", time: "14m ago" },
    { id: 3, type: "error", title: "Webhook Failed", desc: "POST to https://api.company.com failed (503)", time: "1h ago" },
  ];

  const Sidebar = (
    <aside
      className="flex flex-col h-full"
      style={{
        background: "rgba(5,5,5,0.96)",
        borderRight: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-2.5 px-4 h-[56px] shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/NeoFaceLogoFinal.png" alt="NeoFace" width={120} height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <div
          className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide"
          style={{
            background: isAdmin ? "rgba(129,140,248,0.12)" : "rgba(0,194,255,0.1)",
            color: isAdmin ? "#818cf8" : "#00C2FF",
            border: isAdmin ? "1px solid rgba(129,140,248,0.2)" : "1px solid rgba(0,194,255,0.2)",
          }}
        >
          {isAdmin ? "ADMIN" : "v1"}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(0,229,168,0.04)", border: "1px solid rgba(0,229,168,0.09)" }}
        >
          <span className="status-dot-live shrink-0" />
          <span className="text-[10.5px] text-[rgba(0,229,168,0.75)] font-medium flex-1">
            {isAdmin ? "Operations Live" : "All systems operational"}
          </span>
          <span className="text-[9px] text-[rgba(255,255,255,0.2)] font-mono">{time}</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-0.5 scrollbar-thin">
        {nav.map((group) => (
          <div key={group.section}>
            <NavSection label={group.section} />
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href, (item as any).exact)}
                comingSoon={(item as any).comingSoon}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div
        className="px-3 py-3 shrink-0 space-y-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={handleLogout}
          className="nav-item w-full"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}
        >
          <LogOut size={13} />
          Sign out
        </button>

        <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg mt-1"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              background: isAdmin ? "rgba(129,140,248,0.15)" : "rgba(0,194,255,0.12)",
              color: isAdmin ? "#818cf8" : "#00C2FF",
              border: isAdmin ? "1px solid rgba(129,140,248,0.25)" : "1px solid rgba(0,194,255,0.2)",
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-[rgba(255,255,255,0.75)] truncate leading-tight">
              {user?.name ?? "User"}
            </p>
            <p className="text-[9.5px] text-[rgba(255,255,255,0.3)] truncate leading-tight mt-0.5">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#050505" }}
    >
      {/* ── Subtle dot grid ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        }}
      />

      {/* ── Desktop Sidebar ── */}
      <div
        className="hidden lg:flex flex-col w-[220px] shrink-0 fixed inset-y-0 left-0 z-30"
        style={{ backdropFilter: "blur(20px)" }}
      >
        {Sidebar}
      </div>

      {/* ── Mobile sidebar backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[220px] z-50 lg:hidden"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-[220px] min-h-screen relative z-10 flex flex-col">
        {/* Mobile + Desktop top bar */}
        <div
          className="flex items-center gap-3 px-4 lg:px-6 h-14 shrink-0 sticky top-0 z-20"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(5,5,5,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button onClick={() => setMobileOpen(true)} className="lg:hidden">
            <Menu size={18} className="text-[rgba(255,255,255,0.5)]" />
          </button>
          <Image src="/NeoFaceLogoFinal.png" alt="NeoFace" width={100} height={30} className="h-6 w-auto lg:hidden" />

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-1.5 text-[12px]">
            <span style={{ color: "rgba(255,255,255,0.25)" }}>NeoFace</span>
            <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.15)" }} />
            <span style={{ color: "rgba(255,255,255,0.6)" }}>
              {pathname.split("/").pop()?.replace(/-/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase()) || "Dashboard"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Status chip */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-medium"
              style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.12)", color: "#00E5A8" }}>
              <span className="status-dot-live" />
              Production
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Bell size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#f87171]" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-80 rounded-2xl overflow-hidden z-50"
                    style={{ background: "rgba(12,12,12,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-[13px] font-semibold text-white">Notifications</p>
                      <button className="text-[11px]" style={{ color: "#00C2FF" }}>Mark all read</button>
                    </div>
                    <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {MOCK_NOTIFS.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0"
                              style={{ background: n.type === "success" ? "#00E5A8" : n.type === "warning" ? "#fbbf24" : "#f87171" }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-medium text-white">{n.title}</p>
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{n.desc}</p>
                            </div>
                            <span className="text-[10px] shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button className="text-[11.5px] text-center w-full" style={{ color: "rgba(0,194,255,0.7)" }}>
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
              style={{
                background: isAdmin ? "rgba(129,140,248,0.12)" : "rgba(0,194,255,0.1)",
                color: isAdmin ? "#818cf8" : "#00C2FF",
                border: isAdmin ? "1px solid rgba(129,140,248,0.2)" : "1px solid rgba(0,194,255,0.15)",
              }}>
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 page-in">
          {children}
        </div>
      </main>
    </div>
  );
}
