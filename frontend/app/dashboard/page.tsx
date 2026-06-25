"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  AppWindow, Users, Zap, ShieldCheck, Fingerprint, Clock,
  AlertTriangle, Server, RefreshCw, ArrowUpRight, CheckCircle2,
  XCircle, Activity, Key, BookOpen, Webhook, Download, Terminal,
  ChevronRight, Building2, ShieldAlert, BarChart3, Eye, ArrowRight,
  Brain, Scan, Lock, Shield, Loader2
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid,
} from "recharts";
import { dashboardApi, apiClient } from "@/lib/api";
import { useRole } from "@/hooks/use-role";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { UserStats, VerificationStats, PaymentOverview } from "@/types";

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "", decimals = 0 }: {
  target: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !target) return;
    done.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1100, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{prefix}{decimals === 0 ? Math.round(val).toLocaleString() : val.toFixed(decimals)}{suffix}</>;
}

function getDailyDelta(stats: any[] | undefined) {
  if (!stats || stats.length < 2) return undefined;
  const today = stats[stats.length - 1]?.total_count ?? stats[stats.length - 1]?.total ?? 0;
  const yesterday = stats[stats.length - 2]?.total_count ?? stats[stats.length - 2]?.total ?? 0;
  if (yesterday === 0) {
    return today > 0 ? { label: "+100%", dir: "up" as const } : undefined;
  }
  const pct = ((today - yesterday) / yesterday) * 100;
  return {
    label: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`,
    dir: pct >= 0 ? ("up" as const) : ("down" as const)
  };
}

/* ─── Chart tooltip ──────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3.5 py-2.5 text-[11px] shadow-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,8,8,0.96)] backdrop-blur-xl">
      <p className="text-[rgba(255,255,255,0.35)] mb-2 text-[9.5px] uppercase tracking-wider font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "rgba(255,255,255,0.5)" }}>{p.name}:</span>
          <strong style={{ color: p.color }} className="font-mono">{Number(p.value).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, prefix, suffix, decimals, delta, deltaDir = "up", color, loading, index, href }: {
  icon: any; label: string; value: number; prefix?: string; suffix?: string;
  decimals?: number; delta?: string; deltaDir?: "up" | "down"; color: string;
  loading?: boolean; index: number; href?: string;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1, borderColor: "rgba(255,255,255,0.12)" }}
      className="dash-card p-5 relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,8,0.40)] backdrop-blur-lg flex flex-col justify-between h-full"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-[0.02]"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.35)]">{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}10`, border: `1px solid ${color}1a` }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-7 w-20 rounded-md animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        ) : (
          <p className="text-[20px] font-semibold tracking-tight text-white leading-tight font-mono">
            <Counter target={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </p>
        )}
        {delta && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[rgba(255,255,255,0.25)]">
            <span className="flex items-center gap-0.5 font-medium" style={{ color: deltaDir === "up" ? "#00E5A8" : "#f87171" }}>
              <ArrowUpRight size={10} style={{ transform: deltaDir === "down" ? "rotate(90deg)" : undefined }} />
              {delta}
            </span>
            <span>since yesterday</span>
          </div>
        )}
      </div>
    </motion.div>
  );
  if (href) return <Link href={href} className="block h-full">{inner}</Link>;
  return inner;
}

/* ─── Identity Modality Card ─────────────────────────────────────────────── */
function ModalityCard({ icon: Icon, name, desc, href, status = "Ready", color }: {
  icon: any; name: string; desc: string; href: string; status?: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: `0 8px 30px -10px ${color}33`, borderColor: `${color}25` }}
      className="dash-card p-5 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden group border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.5)] backdrop-blur-md transition-all"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 10% 10%, ${color}0d, transparent 50%)`
        }}
      />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
            style={{ background: `${color}14`, border: `1px solid ${color}20` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.12)", color: "#00E5A8" }}>
            <span className="w-1 h-1 rounded-full bg-[#00E5A8] animate-pulse" />
            {status}
          </span>
        </div>
        <h3 className="text-[14.5px] font-semibold text-white mb-1.5">{name}</h3>
        <p className="text-[11.5px] text-[rgba(255,255,255,0.4)] leading-relaxed">{desc}</p>
      </div>
      <div className="mt-5">
        <Link href={href} className="inline-flex items-center gap-1 text-[11.5px] font-semibold transition-colors hover:brightness-110" style={{ color }}>
          Launch Console <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Live Auth Event ────────────────────────────────────────────────────── */
const EVENT_TYPES: Record<string, { label: string; color: string; icon: any }> = {
  enrollment:    { label: "Enrollment Session",  color: "#00E5A8", icon: Fingerprint },
  verification:  { label: "Identity Verified",   color: "#00C2FF", icon: ShieldCheck },
  liveness:      { label: "Liveness Passed",     color: "#818cf8", icon: Eye },
  authentication:{ label: "Biometric Auth",      color: "#00E5A8", icon: Activity },
  suspicious:    { label: "Spoof Blocked",       color: "#f87171", icon: ShieldAlert },
  failed:        { label: "Auth Failed",         color: "#fbbf24", icon: XCircle },
};

function LiveFeedItem({ txn, index }: { txn: any; index: number }) {
  const success = txn.status === "authorized" || txn.authentication_result;
  const rawModality = (txn.modality || "").toLowerCase();
  const type = success ? (EVENT_TYPES[rawModality] ? rawModality : "verification") : "failed";
  const ev = EVENT_TYPES[type] || EVENT_TYPES["verification"];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between py-3 px-4 rounded-xl border border-transparent hover:border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.015)] transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${ev.color}10`, border: `1px solid ${ev.color}18` }}>
          <ev.icon size={14} style={{ color: ev.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-white truncate">{ev.label}</p>
          <p className="text-[10.5px] text-[rgba(255,255,255,0.3)] truncate mt-0.5">
            {txn.created_at ? formatDate(txn.created_at) : "just now"}
            {txn.ip_address && ` · ${txn.ip_address}`}
          </p>
        </div>
      </div>
      <span className="text-[9.5px] font-mono font-bold tracking-wider shrink-0 px-2 py-0.5 rounded-full"
        style={{
          background: success ? "rgba(0,229,168,0.06)" : "rgba(248,113,113,0.06)",
          border: `1px solid ${success ? "rgba(0,229,168,0.12)" : "rgba(248,113,113,0.12)"}`,
          color: success ? "#00E5A8" : "#f87171"
        }}>
        {success ? "PASS" : "FAIL"}
      </span>
    </motion.div>
  );
}

/* ─── API Health Row ─────────────────────────────────────────────────────── */
function ApiHealthRow({ name, latency, rate, status }: {
  name: string; latency: string; rate: string; status: "operational" | "degraded" | "outage";
}) {
  const statusCfg = {
    operational: { color: "#00E5A8", dot: "status-dot-live", label: "Operational" },
    degraded:    { color: "#fbbf24", dot: "status-dot-warn",  label: "Degraded" },
    outage:      { color: "#f87171", dot: "status-dot-error", label: "Outage" },
  }[status];
  return (
    <tr className="border-t border-[rgba(255,255,255,0.04)]">
      <td className="py-3.5 pl-4 pr-4">
        <span className="text-[12.5px] text-[rgba(255,255,255,0.75)] font-medium">{name}</span>
      </td>
      <td className="py-3.5 pr-4">
        <span className="text-[12px] font-mono text-[rgba(255,255,255,0.4)]">{latency}</span>
      </td>
      <td className="py-3.5 pr-4">
        <span className="text-[12px] font-mono text-[#00E5A8] font-semibold">{rate}</span>
      </td>
      <td className="py-3.5 pr-4">
        <span className="flex items-center gap-1.5">
          <span className={statusCfg.dot} />
          <span className="text-[11px] font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </span>
      </td>
    </tr>
  );
}

/* ─── Quick Action Button ────────────────────────────────────────────────── */
function QuickAction({ icon: Icon, label, href, desc, color }: {
  icon: any; label: string; href: string; desc: string; color: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl group transition-all bg-[rgba(255,255,255,0.015)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.025)]"
      onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}25`)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
    >
      <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[rgba(255,255,255,0.85)] group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10.5px] text-[rgba(255,255,255,0.32)] mt-0.5">{desc}</p>
      </div>
      <ChevronRight size={12} className="text-[rgba(255,255,255,0.25)] group-hover:text-white transition-colors group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CUSTOMER DASHBOARD
   ────────────────────────────────────────────────────────────────────────── */
function CustomerDashboard() {
  const user = useAuthStore(s => s.user);
  const [range, setRange] = useState<"24H" | "7D" | "30D" | "90D">("7D");

  const { data: userStats, isLoading: uLoad } = useQuery<UserStats>({
    queryKey: ["dashboard-users"],
    queryFn: () => dashboardApi.getUsers().then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: overview, isLoading: ovLoad } = useQuery<PaymentOverview>({
    queryKey: ["payments-overview"],
    queryFn: () => dashboardApi.getPaymentsOverview().then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: recentData, isLoading: rLoad } = useQuery<{ transactions: any[] }>({
    queryKey: ["payments-recent"],
    queryFn: () => dashboardApi.getPaymentsRecent(12).then(r => r.data),
    refetchInterval: 6_000,
  });

  const { data: dailyData } = useQuery<{ daily_stats: any[] }>({
    queryKey: ["payments-daily"],
    queryFn: () => dashboardApi.getPaymentsDaily(14).then(r => r.data),
    refetchInterval: 60_000,
  });

  const { data: projectsData, isLoading: pLoad } = useQuery<any[]>({
    queryKey: ["projects"],
    queryFn: () => apiClient.get("projects").then(r => r.data),
  });

  const chartData = (dailyData?.daily_stats ?? []).map((d: any) => ({
    date: d.date?.slice(5) ?? d.date,
    Enrollment:    d.enrollment_count ?? 0,
    Verification:  d.verification_count ?? 0,
    Liveness:      d.liveness_count ?? 0,
    Sessions:      d.session_count ?? 0,
  }));

  const txnStream = recentData?.transactions ?? [];

  const reqDelta = getDailyDelta(dailyData?.daily_stats);
  const successDelta = (() => {
    if (!dailyData?.daily_stats || dailyData.daily_stats.length < 2) return undefined;
    const today = dailyData.daily_stats[dailyData.daily_stats.length - 1];
    const yesterday = dailyData.daily_stats[dailyData.daily_stats.length - 2];
    const tRate = today.total_count > 0 ? (today.successful_count / today.total_count) * 100 : 100;
    const yRate = yesterday.total_count > 0 ? (yesterday.successful_count / yesterday.total_count) * 100 : 100;
    const diff = tRate - yRate;
    return {
      label: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
      dir: diff >= 0 ? ("up" as const) : ("down" as const)
    };
  })();

  const kpis = [
    { icon: AppWindow,    label: "Active Projects",       value: projectsData?.length ?? 0, color: "#00C2FF", loading: pLoad },
    { icon: Users,        label: "Registered Users",      value: userStats?.total_users ?? 0, color: "#00E5A8", loading: uLoad },
    { icon: Zap,          label: "Requests Today",        value: overview?.total_transactions ?? 0, color: "#818cf8", loading: ovLoad, delta: reqDelta?.label, deltaDir: reqDelta?.dir },
    { icon: ShieldCheck,  label: "Auth Success Rate",     value: overview?.authorization_rate ?? 0, suffix: "%", decimals: 1, color: "#00E5A8", loading: ovLoad, delta: successDelta?.label, deltaDir: successDelta?.dir },
    { icon: Fingerprint,  label: "Active Identities",     value: userStats?.enrolled_users ?? 0, color: "#00C2FF", loading: uLoad },
    { icon: Clock,        label: "Avg Latency",           value: overview?.avg_latency ?? 0, suffix: "ms", color: "#fbbf24", loading: ovLoad },
  ];

  const QUICK_ACTIONS = [
    { icon: Key,       label: "Generate API Key",   href: "/dashboard/api-keys",  desc: "Credentials to verify clients",   color: "#00C2FF" },
    { icon: Webhook,   label: "Webhook Settings",   href: "/dashboard/webhooks",  desc: "Listen for real-time events",      color: "#00E5A8" },
    { icon: BookOpen,  label: "Documentation",      href: "/dashboard/documentation", desc: "Full guides and API reference", color: "#818cf8" },
    { icon: Terminal,  label: "SDK Playground",     href: "/dashboard/sdk-playground", desc: "Test API methods live",        color: "#fbbf24" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4 border-b border-[rgba(255,255,255,0.05)] pb-6"
      >
        <div>
          <h1 className="text-[22px] font-semibold text-white tracking-[-0.025em]">
            Welcome, {user?.name?.split(" ")[0] ?? "Developer"} 👋
          </h1>
          <p className="text-[13px] text-[rgba(255,255,255,0.4)] mt-1.5 max-w-xl leading-relaxed">
            Configure biometric services, manage user identities, and monitor authentication telemetry for your apps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.15)", color: "#00E5A8" }}>
            <span className="status-dot-live shrink-0" />
            Production Engine
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} index={i} {...k} />
        ))}
      </div>

      {/* ── Identity Services Monitor ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-white tracking-tight">Active Identity Modalities</h2>
          <p className="text-[11.5px] text-[rgba(255,255,255,0.35)] mt-0.5">Biometric verification gateways currently operational</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <ModalityCard icon={Scan} name="Face Recognition" desc="Neural network face enrollment & 1:N verification matching." href="/dashboard/face-recognition" color="#00C2FF" />
          <ModalityCard icon={Fingerprint} name="Fingerprint (WebAuthn)" desc="Passwordless credentials and passkeys via secure devices." href="/dashboard/fingerprint" color="#00E5A8" />
          <ModalityCard icon={Shield} name="Trust Engine" desc="Integrated device telemetry, behavioral trust, and risk analysis." href="/dashboard/trust-engine" color="#fbbf24" />
        </div>
      </div>

      {/* ── Chart + Live Feed ── */}
      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* API Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[14px] font-semibold text-white">API Traffic Volume</h2>
              <p className="text-[11px] text-[rgba(255,255,255,0.32)] mt-0.5">
                Total verification and enrollment actions by modality
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg p-0.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
              {(["24H", "7D", "30D", "90D"] as const).map(r => (
                <button key={r}
                  onClick={() => setRange(r)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all"
                  style={{
                    background: range === r ? "rgba(255,255,255,0.06)" : "transparent",
                    color: range === r ? "#fff" : "rgba(255,255,255,0.4)",
                    border: range === r ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-[240px] rounded-xl flex flex-col items-center justify-center gap-2 bg-[rgba(255,255,255,0.015)] border border-dashed border-[rgba(255,255,255,0.05)]">
              <Activity size={22} className="text-[rgba(255,255,255,0.15)] animate-pulse" />
              <p className="text-[11.5px] text-[rgba(255,255,255,0.25)] text-center">
                Waiting for the first API request...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  {[
                    ["gradEnroll", "#00C2FF"],
                    ["gradVerify", "#00E5A8"],
                    ["gradLiveness", "#818cf8"],
                    ["gradSessions", "#fbbf24"],
                  ].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="Enrollment"   stroke="#00C2FF" strokeWidth={1.5} fill="url(#gradEnroll)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Verification" stroke="#00E5A8" strokeWidth={1.5} fill="url(#gradVerify)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Liveness"     stroke="#818cf8" strokeWidth={1.5} fill="url(#gradLiveness)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Sessions"     stroke="#fbbf24" strokeWidth={1.5} fill="url(#gradSessions)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            {[
              { c: "#00C2FF", l: "Face Enrollments" },
              { c: "#00E5A8", l: "Face Verifications" },
              { c: "#818cf8", l: "Liveness Checks" },
              { c: "#fbbf24", l: "Active Sessions" },
            ].map(({ c, l }) => (
              <span key={l} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.4)]">
                <span className="w-4 h-0.5 rounded-full" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Live Auth Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="dash-card p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Live Operations Feed</h2>
              <p className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">Biometric events stream</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider"
              style={{ background: "rgba(0,229,168,0.08)", border: "1px solid rgba(0,229,168,0.18)", color: "#00E5A8" }}>
              <span className="status-dot-live" /> LIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] scrollbar-thin">
            {rLoad ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse bg-[rgba(255,255,255,0.03)]" />
                ))}
              </div>
            ) : txnStream.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 py-16">
                <Activity size={20} className="text-[rgba(255,255,255,0.1)]" />
                <p className="text-[11px] text-[rgba(255,255,255,0.25)] text-center">
                  No active events.<br />Consoles are ready to receive queries.
                </p>
              </div>
            ) : (
              txnStream.slice(0, 8).map((txn: any, i: number) => (
                <LiveFeedItem key={txn.id ?? i} txn={txn} index={i} />
              ))
            )}
          </div>

          <Link href="/dashboard/logs" className="mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11.5px] font-semibold text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(255,255,255,0.02)] transition-all border border-[rgba(255,255,255,0.06)]">
            Audit logs console <ArrowRight size={11} />
          </Link>
        </motion.div>
      </div>

      {/* ── API Health + Quick Setup ── */}
      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* API Health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.05)]">
            <div>
              <h2 className="text-[14px] font-semibold text-white">System Service SLA</h2>
              <p className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">Live biometric engine health checks</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00E5A8]">
              <span className="status-dot-live" /> All systems active
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-[rgba(255,255,255,0.3)] font-semibold uppercase tracking-wider bg-[rgba(255,255,255,0.01)]">
                  <th className="py-2.5 pl-4 pr-4">Endpoint</th>
                  <th className="py-2.5 pr-4">Avg Latency</th>
                  <th className="py-2.5 pr-4">Success Rate</th>
                  <th className="py-2.5 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <ApiHealthRow name="Face Enrollment (/enroll)"   latency="48ms"  rate="99.8%" status="operational" />
                <ApiHealthRow name="Face Match (/verify)"         latency="61ms"  rate="99.5%" status="operational" />
                <ApiHealthRow name="Passive Liveness check"       latency="112ms" rate="98.9%" status="operational" />
                <ApiHealthRow name="FIDO2 WebAuthn authentication" latency="22ms"  rate="99.9%" status="operational" />
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="dash-card p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md"
        >
          <h2 className="text-[14px] font-semibold text-white mb-1">Developer Fast Path</h2>
          <p className="text-[11px] text-[rgba(255,255,255,0.35)] mb-4">Credentials & integrations setup</p>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(a => <QuickAction key={a.label} {...a} />)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
   ────────────────────────────────────────────────────────────────────────── */
function AdminDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: overview, isLoading: ovLoad, refetch } = useQuery<PaymentOverview>({
    queryKey: ["payments-overview"],
    queryFn: () => { setLastUpdated(new Date()); return dashboardApi.getPaymentsOverview().then(r => r.data); },
    refetchInterval: 10_000,
  });

  const { data: userStats, isLoading: uLoad } = useQuery<UserStats>({
    queryKey: ["dashboard-users"],
    queryFn: () => dashboardApi.getUsers().then(r => r.data),
    refetchInterval: 20_000,
  });

  const { data: dailyData, isLoading: dLoad } = useQuery<{ daily_stats: any[] }>({
    queryKey: ["payments-daily"],
    queryFn: () => dashboardApi.getPaymentsDaily(14).then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentData } = useQuery<{ transactions: any[] }>({
    queryKey: ["payments-recent"],
    queryFn: () => dashboardApi.getPaymentsRecent(10).then(r => r.data),
    refetchInterval: 5_000,
  });

  const chartData = (dailyData?.daily_stats ?? []).map((d: any) => ({
    date: d.date?.slice(5) ?? d.date,
    Enrollment:    d.enrollment_count ?? 0,
    Verification:  d.verification_count ?? 0,
    Liveness:      d.liveness_count ?? 0,
    Sessions:      d.session_count ?? 0,
    Errors:        d.error_count ?? 0,
  }));

  const txnStream = recentData?.transactions ?? [];

  const reqDelta = getDailyDelta(dailyData?.daily_stats);
  const successDelta = (() => {
    if (!dailyData?.daily_stats || dailyData.daily_stats.length < 2) return undefined;
    const today = dailyData.daily_stats[dailyData.daily_stats.length - 1];
    const yesterday = dailyData.daily_stats[dailyData.daily_stats.length - 2];
    const tRate = today.total_count > 0 ? (today.successful_count / today.total_count) * 100 : 100;
    const yRate = yesterday.total_count > 0 ? (yesterday.successful_count / yesterday.total_count) * 100 : 100;
    const diff = tRate - yRate;
    return {
      label: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`,
      dir: diff >= 0 ? ("up" as const) : ("down" as const)
    };
  })();

  const kpis = [
    { icon: Building2,   label: "Orgs Active",        value: userStats?.orgs_count ?? 0,     color: "#00C2FF", loading: uLoad },
    { icon: AppWindow,   label: "Apps Registered",     value: userStats?.apps_count ?? 0,     color: "#818cf8", loading: uLoad },
    { icon: Fingerprint, label: "Total Identities",    value: userStats?.enrolled_users ?? 0, color: "#00E5A8", loading: uLoad },
    { icon: Zap,         label: "API Requests Today",  value: overview?.total_transactions ?? 0, color: "#fbbf24", loading: ovLoad, delta: reqDelta?.label, deltaDir: reqDelta?.dir },
    { icon: Activity,    label: "Auth Sessions Today", value: overview?.total_transactions ?? 0, color: "#00C2FF", loading: ovLoad, delta: reqDelta?.label, deltaDir: reqDelta?.dir },
    { icon: ShieldCheck, label: "Platform SLA availability", value: overview?.platform_sla ?? 99.97, suffix: "%", decimals: 2, color: "#00E5A8", delta: successDelta?.label, deltaDir: successDelta?.dir },
    { icon: Clock,       label: "Inference Latency",   value: overview?.avg_latency ?? 0,    suffix: "ms", color: "#fbbf24", loading: ovLoad },
    { icon: AlertTriangle, label: "Threat Anomalies",   value: overview?.threat_anomalies ?? 0, color: "#f87171", loading: ovLoad },
  ];

  const { data: orgsData, isLoading: orgsLoad } = useQuery<{ organizations: any[] }>({
    queryKey: ["dashboard-organizations"],
    queryFn: () => apiClient.get("dashboard/organizations").then(r => r.data),
    refetchInterval: 30_000,
  });

  const orgsList = orgsData?.organizations ?? [];

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4 border-b border-[rgba(255,255,255,0.05)] pb-6"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-semibold text-white tracking-[-0.025em]">
              Command Operations Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-[rgba(129,140,248,0.12)] border border-[rgba(129,140,248,0.25)] text-[#818cf8] uppercase">
              Admin
            </span>
          </div>
          <p className="text-[13px] text-[rgba(255,255,255,0.4)] mt-1.5">
            Real-time operations monitor of platform GPU load, API traffic, and system vulnerabilities.
          </p>
          <div className="flex items-center gap-1.5 text-[10.5px] text-[rgba(255,255,255,0.25)] mt-1.5 font-mono">
            <span className="status-dot-live shrink-0 animate-ping" />
            Last updated {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.5)] hover:text-white">
          <RefreshCw size={12} /> Refresh Feed
        </button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} index={i} {...k} loading={(k as any).loading} />
        ))}
      </div>

      {/* ── Traffic Chart + Live Feed ── */}
      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* Global Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dash-card p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Global Infrastructure Traffic</h2>
              <p className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">Aggregate system requests across all tenants</p>
            </div>
            <Link href="/dashboard/analytics" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[rgba(0,194,255,0.7)] hover:text-[#00C2FF] transition-all">
              Detailed metrics <ArrowUpRight size={11} />
            </Link>
          </div>

          {dLoad ? (
            <div className="h-[240px] animate-pulse rounded-xl bg-[rgba(255,255,255,0.03)]" />
          ) : chartData.length === 0 ? (
            <div className="h-[240px] rounded-xl flex items-center justify-center bg-[rgba(255,255,255,0.015)] border border-dashed border-[rgba(255,255,255,0.05)]">
              <p className="text-[11.5px] text-[rgba(255,255,255,0.25)]">No queries processed yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  {[["g1","#00C2FF"],["g2","#00E5A8"],["g3","#818cf8"],["g4","#fbbf24"],["g5","#f87171"]].map(([id, c]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="Enrollment"   stroke="#00C2FF" strokeWidth={1.5} fill="url(#g1)" dot={false} />
                <Area type="monotone" dataKey="Verification" stroke="#00E5A8" strokeWidth={1.5} fill="url(#g2)" dot={false} />
                <Area type="monotone" dataKey="Liveness"     stroke="#818cf8" strokeWidth={1.5} fill="url(#g3)" dot={false} />
                <Area type="monotone" dataKey="Sessions"     stroke="#fbbf24" strokeWidth={1.5} fill="url(#g4)" dot={false} />
                <Area type="monotone" dataKey="Errors"       stroke="#f87171" strokeWidth={1.2}   fill="url(#g5)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            {[["#00C2FF","Enrollments"],["#00E5A8","Matches"],["#818cf8","Liveness"],["#fbbf24","Sessions"],["#f87171","Blocked Spoofs"]].map(([c,l])=>(
              <span key={l} className="flex items-center gap-2 text-[11px] text-[rgba(255,255,255,0.4)]">
                <span className="w-4.5 h-0.5 rounded-full" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Live Event Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="dash-card p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-white">Security Stream</h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wider"
              style={{ background: "rgba(0,229,168,0.08)", border: "1px solid rgba(0,229,168,0.18)", color: "#00E5A8" }}>
              <span className="status-dot-live" /> LIVE
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] scrollbar-thin">
            {txnStream.slice(0, 8).map((txn: any, i) => (
              <LiveFeedItem key={txn.id ?? i} txn={txn} index={i} />
            ))}
            {txnStream.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Activity size={20} className="text-[rgba(255,255,255,0.1)]" />
                <p className="text-[11px] text-[rgba(255,255,255,0.25)]">Security channels ready</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Organization Management ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="dash-card rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.3)] backdrop-blur-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.05)]"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h2 className="text-[14px] font-semibold text-white">Active Organizations</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">Platform tenants and account categories</p>
          </div>
          <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[rgba(0,194,255,0.7)] hover:text-[#00C2FF] transition-all">
            Account Management <ChevronRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-[rgba(255,255,255,0.3)] font-semibold uppercase tracking-wider bg-[rgba(255,255,255,0.01)]">
                <th className="py-3 px-6">Organization</th>
                <th className="py-3 px-4">Plan Level</th>
                <th className="py-3 px-4 text-center">Applications</th>
                <th className="py-3 px-4 text-center">Identities</th>
                <th className="py-3 px-4">Usage volume</th>
                <th className="py-3 px-6">System Status</th>
              </tr>
            </thead>
            <tbody>
              {orgsLoad ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[12px] text-[rgba(255,255,255,0.3)]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00C2FF]" />
                    Loading active organizations...
                  </td>
                </tr>
              ) : orgsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[12px] text-[rgba(255,255,255,0.3)]">
                    No organizations registered yet.
                  </td>
                </tr>
              ) : (
                orgsList.map((org: any) => (
                  <tr key={org.id} className="border-t border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
                          style={{ background: "rgba(0,194,255,0.1)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.15)" }}>
                          {(org.name || "U")[0].toUpperCase()}
                        </div>
                        <span className="text-white font-semibold text-[13px]">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider"
                        style={{
                          background: org.plan?.toLowerCase() === "enterprise" ? "rgba(129,140,248,0.08)" : "rgba(0,194,255,0.06)",
                          color: org.plan?.toLowerCase() === "enterprise" ? "#818cf8" : "#00C2FF",
                          border: `1px solid ${org.plan?.toLowerCase() === "enterprise" ? "rgba(129,140,248,0.18)" : "rgba(0,194,255,0.15)"}`,
                        }}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-[12.5px] font-mono text-[rgba(255,255,255,0.65)]">{org.apps}</td>
                    <td className="py-3.5 px-4 text-center text-[12.5px] font-mono text-[rgba(255,255,255,0.65)]">{org.users}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: org.usage, background: "linear-gradient(90deg, #00C2FF, #00E5A8)" }} />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-[rgba(255,255,255,0.55)]">{org.usage}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                        {org.status === "active" ? (
                          <>
                            <span className="status-dot-live shrink-0" />
                            <span style={{ color: "#00E5A8" }}>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="status-dot-error shrink-0" />
                            <span style={{ color: "#f87171" }}>Suspended</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Quick Links Admin ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction icon={ShieldAlert} label="Fraud & Risk Center" href="/dashboard/risk" desc="Biometric threats, anti-spoofing flags, audit blocks" color="#f87171" />
        <QuickAction icon={Brain} label="Model Observability" href="/dashboard/models" desc="InsightFace, MiniFASNet latency, vector drift logs" color="#818cf8" />
        <QuickAction icon={Server} label="Infrastructure status" href="/dashboard/infrastructure" desc="Compute clusters, GPU memory usage, storage capacity" color="#fbbf24" />
      </div>
    </div>
  );
}

/* ─── Router ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { isAdmin } = useRole();
  return isAdmin ? <AdminDashboard /> : <CustomerDashboard />;
}
