"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#3b82f6",
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
            style={{ borderColor: "#3b82f620", backgroundColor: "#3b82f605", color: "#3b82f6" }}
          >
            Legal
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Refund &{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #00C2FF)" }}>
              Cancellation Policy
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Effective Date: January 1, 2026. This policy explains how billing, cancellation, 
            downgrade, and refund requests are handled for all NeoFace Labs subscription plans.
          </p>
        </div>

        {/* Plans Overview */}
        <SectionCard title="Subscription Model" accent="#3b82f6">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace operates on a monthly recurring subscription model. All plans are billed in advance 
            at the start of each billing cycle. Usage overages (verifications beyond your plan limit) 
            are billed at the end of each cycle based on actual consumption.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Billing Cycle", val: "Monthly" },
              { label: "Billing Currency", val: "USD" },
              { label: "Payment Methods", val: "Card, ACH, Wire (Enterprise)" },
            ].map((s) => (
              <div key={s.label} className="p-3.5 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-[12px] font-bold text-blue-400 mb-1">{s.val}</div>
                <div className="text-[10.5px] text-white/30">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Cancellation */}
        <SectionCard title="Cancellation Policy" accent="#00E5A8">
          <div className="space-y-3 text-[12px] text-white/50">
            <div className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
              <h3 className="text-[12px] font-semibold text-white mb-2">How to Cancel</h3>
              <p className="leading-relaxed">
                You can cancel your subscription at any time from the Dashboard under <strong className="text-white">Billing → Cancel Subscription</strong>. 
                Cancellation takes effect at the end of your current billing cycle. You retain full API access until that date.
              </p>
            </div>
            <div className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
              <h3 className="text-[12px] font-semibold text-white mb-2">After Cancellation</h3>
              <p className="leading-relaxed">
                Once your subscription ends, your API keys are deactivated, live API access ceases, and 
                your biometric data is scheduled for deletion within 30 days. Dashboard access is retained 
                for 7 days in read-only mode to allow data export.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Downgrades */}
        <SectionCard title="Plan Downgrades" accent="#a78bfa">
          <ul className="space-y-2.5 text-[12px] text-white/50">
            {[
              "Downgrades to a lower plan take effect at the start of the next billing cycle — not immediately.",
              "If your current usage exceeds the limits of the lower tier, you will receive a warning. You can choose to proceed or remain on your current plan.",
              "Unused verifications from the current billing cycle do not roll over or carry credit.",
              "Upgrading your plan takes effect immediately and is prorated for the remaining days in the billing cycle.",
            ].map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Overages */}
        <SectionCard title="Overage Billing" accent="#f59e0b">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            When your monthly verification count exceeds your plan limit, overages are charged at the 
            per-verification rate for your tier at the end of the billing cycle.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="border-b text-white/40" style={{ borderColor: "#ffffff08" }}>
                  <th className="py-2.5 pr-4">Plan</th>
                  <th className="py-2.5 pr-4">Included Verifications</th>
                  <th className="py-2.5">Overage Rate</th>
                </tr>
              </thead>
              <tbody className="text-white/60 divide-y" style={{ borderColor: "#ffffff06" }}>
                {[
                  ["Free", "5,000", "Not available (upgrade required)"],
                  ["Starter", "50,000", "$0.007 / verification"],
                  ["Pro", "500,000", "$0.005 / verification"],
                  ["Business", "5,000,000", "$0.004 / verification"],
                ].map(([plan, inc, rate]) => (
                  <tr key={plan} className="border-b" style={{ borderColor: "#ffffff06" }}>
                    <td className="py-2.5 pr-4 font-semibold text-amber-400">{plan}</td>
                    <td className="py-2.5 pr-4 font-mono">{inc}</td>
                    <td className="py-2.5 text-white/70">{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Refunds */}
        <SectionCard title="Refund Eligibility" accent="#f43f5e">
          <div className="space-y-3 text-[12px]">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-[12px] font-semibold text-emerald-400 mb-1.5">✓ Eligible for Refund</h3>
              <ul className="space-y-1 text-white/50 text-[11.5px]">
                <li>• New subscriptions cancelled within 7 days of initial signup</li>
                <li>• Billing errors or duplicate charges (must be reported within 30 days)</li>
                <li>• Service unavailability exceeding SLA guarantees in a given month</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <h3 className="text-[12px] font-semibold text-red-400 mb-1.5">✕ Not Eligible for Refund</h3>
              <ul className="space-y-1 text-white/50 text-[11.5px]">
                <li>• Partial months after the 7-day window has elapsed</li>
                <li>• Overage charges from verified API usage</li>
                <li>• Accounts suspended for policy violations</li>
                <li>• Failure to cancel before the next billing cycle</li>
              </ul>
            </div>
          </div>
          <p className="text-[11px] text-white/30 mt-3">
            To request a refund, email billing@neoface.io with your account ID and reason. We respond within 5 business days.
          </p>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
