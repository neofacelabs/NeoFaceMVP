"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

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
            Company
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Get in{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #00C2FF, #00E5A8)" }}
            >
              Touch
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Whether you have a question about the platform, want to report a security issue, 
            or are exploring an enterprise deployment — reach us directly.
          </p>
        </div>

        {/* Primary Contact */}
        <div className="rounded-2xl border p-8" style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}>
          <div className="flex flex-col items-center text-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "#00C2FF10", border: "1px solid #00C2FF25" }}
            >
              ✉️
            </div>
            <div>
              <p className="text-[11px] text-white/30 font-mono uppercase tracking-widest mb-2">Primary Contact</p>
              <a
                href="mailto:neofacelabs@gmail.com"
                className="text-[18px] font-bold tracking-tight transition-colors hover:opacity-80"
                style={{ color: "#00C2FF" }}
              >
                neofacelabs@gmail.com
              </a>
              <p className="text-[12px] text-white/40 mt-2 leading-relaxed">
                For all inquiries — platform questions, partnerships, security reports, and general feedback.
                We typically respond within one business day.
              </p>
            </div>
            <a
              href="mailto:neofacelabs@gmail.com"
              className="px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(to right, #00C2FF, #00E5A8)", color: "#060608" }}
            >
              Send an Email →
            </a>
          </div>
        </div>

        {/* Topic Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "🛠",
              label: "Developer Support",
              desc: "Integration help, SDK issues, API errors, or billing questions.",
            },
            {
              icon: "🤝",
              label: "Enterprise Sales",
              desc: "Custom contracts, SLA negotiations, or volume pricing enquiries.",
            },
            {
              icon: "🔐",
              label: "Security Reports",
              desc: "Responsible disclosure of vulnerabilities. We respond within 24 hours.",
            },
          ].map((t) => (
            <a
              key={t.label}
              href="mailto:neofacelabs@gmail.com"
              className="p-5 rounded-2xl border text-center transition-all hover:border-white/10"
              style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}
            >
              <div className="text-2xl mb-3">{t.icon}</div>
              <h3 className="text-[12px] font-semibold text-white mb-1.5">{t.label}</h3>
              <p className="text-[11px] text-white/40 leading-relaxed">{t.desc}</p>
            </a>
          ))}
        </div>

        {/* Response Time */}
        <div
          className="rounded-2xl border p-5 flex items-center gap-4"
          style={{ borderColor: "#ffffff07", background: "#0c0c0e" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] shrink-0" />
          <p className="text-[12px] text-white/50 leading-relaxed">
            <strong className="text-white">Response time:</strong> We respond to all emails within 1 business day.
            For urgent security disclosures, mention <span className="font-mono text-[11px] text-red-400">[SECURITY]</span> in your subject line for a guaranteed 24-hour response.
          </p>
        </div>
      </div>
    </SubpageLayout>
  );
}
