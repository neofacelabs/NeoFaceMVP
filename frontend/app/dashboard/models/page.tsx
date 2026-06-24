"use client";
import { motion } from "framer-motion";
import { Brain, Cpu, TrendingUp, Activity, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";

const PERF_DATA = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en", { month: "short", day: "numeric" }),
  Accuracy: 99.1 + (Math.random() - 0.5) * 0.4,
  FAR: 0.08 + (Math.random() - 0.5) * 0.03,
  FRR: 0.22 + (Math.random() - 0.5) * 0.05,
  Latency: 110 + (Math.random() - 0.5) * 30,
}));

const RESOURCE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  GPU: 45 + Math.floor(Math.random() * 35),
  CPU: 20 + Math.floor(Math.random() * 25),
  Memory: 55 + Math.floor(Math.random() * 20),
}));

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-[11px] shadow-xl"
      style={{ background: "rgba(8,8,8,0.96)", border: "1px solid rgba(129,140,248,0.15)", backdropFilter: "blur(12px)" }}>
      <p className="text-[rgba(255,255,255,0.4)] mb-2 text-[10px]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-[rgba(255,255,255,0.5)]">{p.name}:</span>
          <strong style={{ color: p.color }}>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

const VERSIONS = [
  { version: "v4.2.1", status: "active",   accuracy: "99.31%", far: "0.07%", frr: "0.21%", deployed: "Jun 15, 2025" },
  { version: "v4.1.8", status: "shadow",   accuracy: "99.18%", far: "0.09%", frr: "0.25%", deployed: "May 2, 2025"  },
  { version: "v4.0.5", status: "archived", accuracy: "98.87%", far: "0.12%", frr: "0.31%", deployed: "Mar 8, 2025"  },
];

export default function ModelsPage() {
  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-semibold text-white tracking-tight">Model Monitoring</h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
              style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", color: "#818cf8" }}>
              AI OPS
            </span>
          </div>
          <p className="text-[13px] text-[rgba(255,255,255,0.38)]">
            NeoFace biometric model performance, accuracy drift, and resource utilization.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.15)", color: "#00E5A8" }}>
          <span className="status-dot-live" /> v4.2.1 Active
        </div>
      </motion.div>

      {/* Current Model KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Accuracy",        value: "99.31%", color: "#00E5A8" },
          { label: "FAR",             value: "0.07%",  color: "#00C2FF" },
          { label: "FRR",             value: "0.21%",  color: "#818cf8" },
          { label: "Precision",       value: "99.6%",  color: "#00E5A8" },
          { label: "Recall",          value: "98.9%",  color: "#00C2FF" },
          { label: "Inf. Latency",    value: "84ms",   color: "#fbbf24" },
          { label: "GPU Usage",       value: "62%",    color: "#818cf8" },
          { label: "Memory",          value: "57%",    color: "#fbbf24" },
        ].map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="dash-card p-3 rounded-2xl text-center">
            <p className="text-[9.5px] text-[rgba(255,255,255,0.28)] uppercase tracking-wider font-medium mb-1.5">{m.label}</p>
            <p className="text-[18px] font-bold" style={{ color: m.color }}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-4">
        {/* Accuracy / FAR / FRR Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="dash-card p-6 rounded-2xl"
          style={{ borderColor: "rgba(129,140,248,0.1)" }}>
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-white">Model Accuracy Trends</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.3)] mt-0.5">Accuracy · FAR · FRR — 14 days</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={PERF_DATA} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10 }} axisLine={false} tickLine={false} width={32} domain={[98, 100]} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="Accuracy" name="Accuracy" stroke="#00E5A8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resource Usage Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="dash-card p-6 rounded-2xl"
          style={{ borderColor: "rgba(129,140,248,0.1)" }}>
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-white">Resource Utilization</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.3)] mt-0.5">GPU · CPU · Memory — 24h</p>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={RESOURCE_DATA} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <defs>
                {[["rg","#818cf8"],["rc","#00C2FF"],["rm","#fbbf24"]].map(([id,c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 9 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.18)", fontSize: 10 }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} unit="%" />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="GPU"    name="GPU"    stroke="#818cf8" strokeWidth={1.5} fill="url(#rg)" dot={false} />
              <Area type="monotone" dataKey="CPU"    name="CPU"    stroke="#00C2FF" strokeWidth={1.5} fill="url(#rc)" dot={false} />
              <Area type="monotone" dataKey="Memory" name="Memory" stroke="#fbbf24" strokeWidth={1.5} fill="url(#rm)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[["#818cf8","GPU"],["#00C2FF","CPU"],["#fbbf24","Memory"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5 text-[10.5px] text-[rgba(255,255,255,0.35)]">
                <span className="w-4 h-0.5 rounded-full" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Version History */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dash-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <h2 className="text-[14px] font-semibold text-white">Model Versions</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.3)] mt-0.5">Version history and rollout status</p>
          </div>
        </div>
        <div className="p-2">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Status</th>
                <th>Accuracy</th>
                <th>FAR</th>
                <th>FRR</th>
                <th>Deployed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {VERSIONS.map(v => (
                <tr key={v.version}>
                  <td>
                    <span className="font-mono font-semibold text-white">{v.version}</span>
                  </td>
                  <td>
                    <span className="flex items-center gap-1.5 text-[11px]">
                      {v.status === "active"
                        ? <><span className="status-dot-live" /><span style={{ color: "#00E5A8" }}>Active</span></>
                        : v.status === "shadow"
                        ? <><span className="status-dot-warn" /><span style={{ color: "#fbbf24" }}>Shadow</span></>
                        : <><span className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]" /><span className="text-[rgba(255,255,255,0.3)]">Archived</span></>}
                    </span>
                  </td>
                  <td><span style={{ color: "#00E5A8" }} className="font-semibold">{v.accuracy}</span></td>
                  <td><span className="font-mono text-[12px]">{v.far}</span></td>
                  <td><span className="font-mono text-[12px]">{v.frr}</span></td>
                  <td>{v.deployed}</td>
                  <td>
                    {v.status !== "active" && (
                      <button className="text-[10.5px] px-2.5 py-1 rounded-lg font-medium transition-all text-[rgba(0,194,255,0.6)] hover:text-[#00C2FF]"
                        style={{ border: "1px solid rgba(0,194,255,0.15)" }}>
                        Promote
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
