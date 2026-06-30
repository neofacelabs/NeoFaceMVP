"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#00C2FF",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => (
  <div className="rounded-2xl border p-6" style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}>
    <h2 className="text-[13px] font-bold mb-4 pb-3 border-b" style={{ color: accent, borderColor: "#ffffff08" }}>
      {title}
    </h2>
    {children}
  </div>
);

export default function Page() {
  return (
    <SubpageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero */}
        <div className="mb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-mono font-semibold uppercase tracking-wider mb-4 border"
            style={{ borderColor: "#00C2FF20", backgroundColor: "#00C2FF05", color: "#00C2FF" }}
          >
            Legal
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Cookie{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00C2FF, #00E5A8)" }}>
              Policy
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Effective Date: January 1, 2026. NeoFace Labs is committed to minimal data collection.
            This policy explains precisely which cookies and local storage entries our platform sets,
            their purpose, and your control options.
          </p>
        </div>

        {/* What Are Cookies */}
        <SectionCard title="What Are Cookies?" accent="#00C2FF">
          <p className="text-[12px] text-white/45 leading-relaxed">
            Cookies are small text files stored in your browser. Local storage entries are similar but 
            persist beyond the browser session. NeoFace uses both mechanisms <strong className="text-white">exclusively</strong> for 
            platform functionality — we have zero marketing trackers, analytics SDKs, or third-party ad pixels.
          </p>
        </SectionCard>

        {/* Cookies We Set */}
        <SectionCard title="Cookies We Set" accent="#00E5A8">
          <div className="space-y-3">
            {[
              {
                name: "__nfl_session",
                type: "Session Cookie",
                expires: "Browser close",
                purpose: "Maintains your authenticated dashboard session. Contains a signed JWT — no PII stored in the cookie itself.",
                required: true,
              },
              {
                name: "__nfl_mfa_proof",
                type: "Session Cookie",
                expires: "30 minutes",
                purpose: "Stores a short-lived proof that you completed biometric MFA for the current session elevation.",
                required: true,
              },
              {
                name: "__nfl_csrf",
                type: "Session Cookie",
                expires: "Browser close",
                purpose: "CSRF protection token for form submissions and state-changing API calls within the dashboard.",
                required: true,
              },
              {
                name: "nfl_ui_theme",
                type: "Persistent Cookie",
                expires: "1 year",
                purpose: "Stores your dashboard theme preference (dark/light). Optional — you can clear this without affecting functionality.",
                required: false,
              },
            ].map((c) => (
              <div key={c.name} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <code className="font-mono text-[11.5px] text-blue-300">{c.name}</code>
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: c.required ? "#00E5A830" : "#ffffff20", color: c.required ? "#00E5A8" : "#6b7280", background: c.required ? "#00E5A808" : "#ffffff05" }}>
                    {c.required ? "Required" : "Preference"}
                  </span>
                  <span className="text-[10px] text-white/30 font-mono">{c.type} · Expires: {c.expires}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{c.purpose}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Local Storage */}
        <SectionCard title="Local Storage Entries" accent="#a78bfa">
          <div className="space-y-2">
            {[
              { key: "nfl_api_key_hint", desc: "Stores the last 6 characters of your active API key for dashboard display. Never stores full credentials." },
              { key: "nfl_dashboard_layout", desc: "Remembers your column layout preferences in the API usage dashboard tables." },
            ].map((l) => (
              <div key={l.key} className="p-3.5 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <code className="font-mono text-[10.5px] text-purple-400 shrink-0 mt-0.5">{l.key}</code>
                <p className="text-[11px] text-white/40">{l.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* No Third-Party */}
        <SectionCard title="Zero Third-Party Trackers" accent="#10b981">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace Labs does not use any of the following third-party cookie categories:
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              "Google Analytics / GA4",
              "Meta Pixel / Facebook CAPI",
              "Intercom session recording",
              "Hotjar or FullStory heatmaps",
              "Advertising / retargeting cookies",
              "LinkedIn Insight Tag",
              "TikTok Pixel",
              "A/B testing platforms (Optimizely, etc.)",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-[11.5px] text-white/40">
                <span className="text-red-400 shrink-0">✕</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Control */}
        <SectionCard title="Managing & Clearing Cookies" accent="#f59e0b">
          <p className="text-[12px] text-white/45 leading-relaxed">
            You can clear all NeoFace cookies and local storage at any time through your browser settings.
            Clearing required session cookies will log you out of the dashboard. Preference cookies (like theme) 
            will reset to defaults. To block cookies entirely, note that the dashboard requires session cookies to function.
          </p>
          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px]">
            {[
              { browser: "Chrome", path: "Settings → Privacy → Clear browsing data" },
              { browser: "Firefox", path: "Preferences → Privacy & Security → Cookies" },
              { browser: "Safari", path: "Preferences → Privacy → Manage Website Data" },
            ].map((b) => (
              <div key={b.browser} className="p-3 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="font-semibold text-white mb-1">{b.browser}</div>
                <p className="text-[10.5px] text-white/35">{b.path}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
