"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#3b82f6",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => (
  <div
    className="rounded-2xl border p-6"
    style={{ borderColor: "#ffffff0a", background: "#0c0c0e" }}
  >
    <h2
      className="text-[13px] font-bold mb-4 pb-3 border-b"
      style={{ color: accent, borderColor: "#ffffff08" }}
    >
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
            Authentication
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Authentication{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #00C2FF)" }}
            >
              Methods
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            NeoFace supports a spectrum of biometric and hardware-bound authentication modalities.
            Each method can be used independently or fused together into a composite trust score for
            higher assurance scenarios.
          </p>
        </div>

        {/* Overview Table */}
        <SectionCard title="Modality Comparison" accent="#3b82f6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead>
                <tr className="border-b text-white/40" style={{ borderColor: "#ffffff08" }}>
                  <th className="py-2.5 pr-4">Modality</th>
                  <th className="py-2.5 pr-4">FAR</th>
                  <th className="py-2.5 pr-4">FRR</th>
                  <th className="py-2.5">Hardware Required</th>
                </tr>
              </thead>
              <tbody className="text-white/70 divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
                {[
                  { modal: "3D Face Geometry", far: "< 0.001%", frr: "0.1%", hw: "RGB-D / Structured Light" },
                  { modal: "Passive Liveness (2D)", far: "< 0.01%", frr: "0.3%", hw: "Standard RGB Camera" },
                  { modal: "Iris Pattern Scan", far: "< 0.0001%", frr: "0.05%", hw: "Near-IR Iris Camera" },
                  { modal: "Fingerprint (Touch ID)", far: "0.002%", frr: "0.2%", hw: "Capacitive Sensor" },
                  { modal: "Behavioral Keystroke", far: "0.5%", frr: "1.2%", hw: "None (Software only)" },
                ].map((r) => (
                  <tr key={r.modal} style={{ borderColor: "#ffffff06" }}>
                    <td className="py-2.5 pr-4 font-semibold text-white">{r.modal}</td>
                    <td className="py-2.5 pr-4 font-mono text-emerald-400">{r.far}</td>
                    <td className="py-2.5 pr-4 font-mono text-blue-400">{r.frr}</td>
                    <td className="py-2.5 text-white/45">{r.hw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10.5px] text-white/25 mt-3">FAR = False Accept Rate. FRR = False Reject Rate. Figures represent NIST-benchmarked averages.</p>
        </SectionCard>

        {/* Face Verification */}
        <SectionCard title="3D Face Geometry Verification" accent="#00E5A8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[12px] font-semibold text-white mb-2">How It Works</h3>
              <p className="text-[11.5px] text-white/45 leading-relaxed">
                NeoFace maps 128 facial landmark nodes using a structured light projection grid. 
                The resulting 3D depth map generates a unique 512-dimensional geometric descriptor 
                that is homomorphically hashed and stored inside a secure enclave — never as a raw image.
              </p>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-white mb-2">Anti-Spoofing Layers</h3>
              <ul className="space-y-1.5 text-[11.5px] text-white/45">
                <li>• Micro-texture analysis (skin pore patterns)</li>
                <li>• IR reflectance validation for silicone masks</li>
                <li>• Depth continuity check against flat prints</li>
                <li>• Blink and head-turn challenge response</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        {/* Iris */}
        <SectionCard title="Iris Pattern Recognition" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Iris scanning captures the unique texture of the iris using near-infrared (NIR) illumination,
            which penetrates contact lenses and is unaffected by color or lighting. Iris codes are generated
            using Daugman&apos;s IrisCodes algorithm — a 2048-bit binary representation derived from Gabor wavelets.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Capture Distance", val: "20–40 cm" },
              { label: "Code Length", val: "2048 bits" },
              { label: "Match Time", val: "< 80ms" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-[16px] font-bold text-purple-400 mb-1">{s.val}</div>
                <div className="text-[10.5px] text-white/35">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Passkey / WebAuthn */}
        <SectionCard title="Device-Bound Passkeys (FIDO2 / WebAuthn)" accent="#f59e0b">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoFace integrates with FIDO2 / WebAuthn to bind biometric verification to a hardware security key.
            After a successful face or iris check, a hardware-attested assertion is generated using the device&apos;s 
            TPM or Secure Enclave (iOS Secure Element, Android StrongBox), and sent to the NeoFace Trust Engine.
          </p>
          <pre className="p-3.5 rounded-xl text-[11px] font-mono text-white/65 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`const credential = await navigator.credentials.create({
  publicKey: {
    challenge: neoface.getChallenge(),
    rp: { name: "NeoFace Identity", id: "app.neoface.io" },
    user: { id: userId, name: email, displayName: name },
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});`}
          </pre>
        </SectionCard>

        {/* Fusion */}
        <SectionCard title="Multi-Modal Fusion Scoring" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            When multiple modalities are used simultaneously, NeoFace applies a weighted Bayesian fusion model
            to produce a single composite <code className="font-mono text-[11px] text-red-400">trust_score</code> (0.0–1.0).
            Weights are configurable per tenant to match your regulatory and risk environment.
          </p>
          <div className="space-y-2">
            {[
              { label: "Face + Liveness", score: "0.92+", use: "Standard consumer authentication" },
              { label: "Face + Iris", score: "0.97+", use: "High-assurance banking & healthcare" },
              { label: "Face + Iris + Passkey", score: "0.99+", use: "Government & military access control" },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "#ffffff06", background: "#0a0a0c" }}>
                <div>
                  <span className="text-[12px] font-semibold text-white">{f.label}</span>
                  <p className="text-[11px] text-white/35 mt-0.5">{f.use}</p>
                </div>
                <span className="font-mono text-[13px] font-bold text-emerald-400">{f.score}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
