"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#f43f5e",
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
            style={{ borderColor: "#f43f5e20", backgroundColor: "#f43f5e05", color: "#f43f5e" }}
          >
            Risk Engine
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Biometric{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #f43f5e, #00C2FF)" }}>
              Trust Engine
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            The NeoFace Trust Engine is a multi-layer real-time risk scoring system that evaluates every 
            verification attempt against a composite of biometric signals, device telemetry, and behavioral 
            anomaly indicators to produce a single actionable trust score.
          </p>
        </div>

        {/* Trust Score */}
        <SectionCard title="The Trust Score" accent="#f43f5e">
          <div className="grid sm:grid-cols-4 gap-3 mb-4">
            {[
              { range: "0.95 – 1.0", label: "Very High", color: "#10b981", desc: "All signals pass. No anomalies detected." },
              { range: "0.80 – 0.94", label: "High", color: "#3b82f6", desc: "Minor signal variance. Acceptable for most use cases." },
              { range: "0.60 – 0.79", label: "Medium", color: "#f59e0b", desc: "Consider step-up challenge or manual review." },
              { range: "0.0 – 0.59", label: "Low / Fail", color: "#f43f5e", desc: "Likely attack or spoofing attempt. Block recommended." },
            ].map((s) => (
              <div key={s.range} className="p-3.5 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="font-bold text-[13px] mb-1" style={{ color: s.color }}>{s.range}</div>
                <div className="text-[11px] font-semibold text-white mb-1.5">{s.label}</div>
                <p className="text-[10px] text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-white/40 leading-relaxed">
            The minimum trust score threshold for acceptance is configurable per tenant and per endpoint.
            Default threshold is 0.85. Lowering it increases acceptance rates but reduces security posture.
          </p>
        </SectionCard>

        {/* Signal Layers */}
        <SectionCard title="Signal Layer Architecture" accent="#00E5A8">
          <div className="space-y-3">
            {[
              {
                layer: "Layer 1 — Biometric Match",
                color: "#00E5A8",
                desc: "Primary biometric template comparison against the enrolled hash. Uses cosine similarity in enclave memory. Weight: 45% of composite score.",
                signals: ["Face geometry distance", "Iris Hamming distance", "Fingerprint ridge match (if applicable)"],
              },
              {
                layer: "Layer 2 — Liveness Analysis",
                color: "#00C2FF",
                desc: "Active and passive detection of presentation attacks. Distinguishes live skin from printed, screen-displayed, or silicone-replicated faces. Weight: 30% of composite score.",
                signals: ["3D depth map continuity", "Skin texture micro-variance", "IR reflectance spectrum", "Blink / motion challenge response"],
              },
              {
                layer: "Layer 3 — Device Integrity",
                color: "#a78bfa",
                desc: "Evaluates the trustworthiness of the capturing device. Checks for virtual cameras, tampered SDKs, and emulated environments. Weight: 15% of composite score.",
                signals: ["Camera attestation token", "SDK integrity hash", "Emulator / virtual device detection", "OS permission anomalies"],
              },
              {
                layer: "Layer 4 — Behavioral Context",
                color: "#f59e0b",
                desc: "Contextual signals around the session: time of day, geolocation drift, velocity from previous verification, and usage pattern anomalies. Weight: 10% of composite score.",
                signals: ["Geo-velocity anomaly", "Session time-of-day consistency", "Verification frequency spike detection"],
              },
            ].map((l) => (
              <div key={l.layer} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold mb-1.5" style={{ color: l.color }}>{l.layer}</h3>
                <p className="text-[11.5px] text-white/45 mb-2.5 leading-relaxed">{l.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {l.signals.map((s) => (
                    <span key={s} className="text-[9.5px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: "#ffffff0c", color: "#ffffff50", background: "#ffffff05" }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* PAD */}
        <SectionCard title="Presentation Attack Detection (PAD)" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Presentation attacks occur when an adversary presents a non-live artifact to the camera —
            printed photos, screen replays, 3D masks, or live video injection. NeoFace PAD operates at multiple layers:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { attack: "Printed Photo Attack", mitigation: "Micro-texture skin analysis detects paper surface artifacts and lack of specular reflection from natural skin oils.", detection: "99.4%" },
              { attack: "Screen Replay Attack", mitigation: "Moire pattern detection and pixel-level anti-aliasing artifacts expose screen-rendered imagery.", detection: "99.1%" },
              { attack: "3D Silicone Mask", mitigation: "Near-IR reflectance profiling differentiates synthetic polymer surface properties from human skin biology.", detection: "97.8%" },
              { attack: "Deepfake Video Injection", mitigation: "Camera attestation at OS level verifies physical hardware. Virtual camera injection attempts fail attestation check.", detection: "98.6%" },
            ].map((a) => (
              <div key={a.attack} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11.5px] font-semibold text-white">{a.attack}</h3>
                  <span className="font-mono text-[12px] font-bold text-emerald-400">{a.detection}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{a.mitigation}</p>
              </div>
            ))}
          </div>
          <p className="text-[10.5px] text-white/25 mt-3">Detection rates measured against NIST FRVT MORPH and ISO 30107-3 PAD benchmark datasets.</p>
        </SectionCard>

        {/* Configuration */}
        <SectionCard title="Configuring Trust Thresholds" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Trust Engine parameters are configurable per project via the Dashboard or API. 
            Balance security posture vs. user friction for your specific deployment context.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`await nfl.trustEngine.configure({
  minTrustScore: 0.88,         // Reject below this threshold
  livenessRequirement: 'high', // 'low' | 'standard' | 'high'
  padSensitivity: 'strict',    // 'permissive' | 'standard' | 'strict'
  stepUpThreshold: 0.80,       // Trigger additional challenge below this
  blockThreshold: 0.60,        // Auto-block below this
  geoVelocityCheck: true,      // Enable location anomaly detection
});`}
          </pre>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
