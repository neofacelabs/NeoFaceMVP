"use client";
import React from "react";
import SubpageLayout from "../components/SubpageLayout";

const SectionCard = ({
  title,
  children,
  accent = "#a78bfa",
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
            style={{ borderColor: "#a78bfa20", backgroundColor: "#a78bfa05", color: "#a78bfa" }}
          >
            Identity Protocol
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            NeoID — Decentralized{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)" }}>
              Identity
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            NeoID is NeoFace Labs&apos; sovereign identity protocol. It enables users to own their digital identity
            anchored to their biometrics — without relying on a centralized authority, social login provider,
            or government-issued document registry.
          </p>
        </div>

        {/* What is NeoID */}
        <SectionCard title="What Is NeoID?" accent="#a78bfa">
          <p className="text-[12px] text-white/45 mb-4 leading-relaxed">
            Traditional identity systems bind your digital persona to a provider (Google, Apple, a government database).
            If that provider goes offline, changes policies, or is breached, your identity is at risk.
            NeoID flips this model: your identity is derived from your unique biological characteristics 
            and anchored cryptographically — controlled only by you.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: "Self-Sovereign", icon: "🔑", desc: "No central registry. Identity lives with the user, cryptographically tied to hardware enclaves." },
              { label: "Biometric-Anchored", icon: "🧬", desc: "DIDs are derived from homomorphic biometric hashes — unique to each user's physiology." },
              { label: "Privacy-Preserving", icon: "🛡", desc: "Zero-Knowledge Proofs let users prove attributes (age, citizenship) without revealing raw identity data." },
            ].map((f) => (
              <div key={f.label} className="p-4 rounded-xl border text-center" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-[12px] font-bold text-white mb-1">{f.label}</div>
                <p className="text-[11px] text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Decentralized Identifiers */}
        <SectionCard title="Decentralized Identifiers (DIDs)" accent="#00E5A8">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoID generates W3C-compliant Decentralized Identifiers (DIDs) using the <code className="font-mono text-[11px] text-emerald-400">did:neo</code> method.
            Each DID is derived from the user&apos;s biometric hash, making it globally unique and biologically anchored.
          </p>
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/65 overflow-x-auto mb-3" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:neo:zQmYUF4N9bPkKAM7zGvTiH2BZn8XaF1mP",
  "verificationMethod": [{
    "id": "did:neo:zQmYUF4N9bPkKAM7...#key-1",
    "type": "EcdsaSecp256k1VerificationKey2019",
    "controller": "did:neo:zQmYUF4N9bPkKAM7...",
    "publicKeyMultibase": "zAnEMJxBXiuDatM..."
  }],
  "biometricAnchor": {
    "type": "FaceGeometryHash",
    "algorithm": "HomomorphicSHA3-512"
  }
}`}
          </pre>
        </SectionCard>

        {/* Verifiable Credentials */}
        <SectionCard title="Verifiable Credentials (VCs)" accent="#00C2FF">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            Issuers (governments, universities, employers) can attach Verifiable Credentials to a NeoID DID.
            These credentials are cryptographically signed and can be presented selectively — without revealing 
            the full credential — using W3C VC standards.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { vc: "Age Verification", desc: "Prove you are over 18 without revealing your exact birthdate or name.", issuer: "Government / KYC Provider" },
              { vc: "Employment Status", desc: "Prove active employment at a company without revealing salary or role.", issuer: "Employer / HR System" },
              { vc: "Medical Clearance", desc: "Prove vaccination status or health check without sharing medical records.", issuer: "Healthcare Provider" },
              { vc: "Financial Accreditation", desc: "Prove accredited investor status without disclosing net worth.", issuer: "Financial Regulator" },
            ].map((c) => (
              <div key={c.vc} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <h3 className="text-[12px] font-semibold text-white mb-1">{c.vc}</h3>
                <p className="text-[11px] text-white/40 mb-2 leading-relaxed">{c.desc}</p>
                <p className="text-[10px] font-mono text-white/25">Issuer: {c.issuer}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ZKP */}
        <SectionCard title="Zero-Knowledge Identity Proofs" accent="#f43f5e">
          <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
            NeoID supports selective disclosure via Zero-Knowledge Proofs (ZKPs). Using ZKP circuits, 
            a user can mathematically prove a statement derived from their credentials 
            (e.g., &quot;my age is greater than 21&quot;) without revealing the underlying data.
          </p>
          <div className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
            <div className="space-y-2 text-[12px]">
              {[
                { label: "Claim", value: "User is over 18 years old" },
                { label: "Proof Type", value: "Groth16 ZK-SNARK Circuit" },
                { label: "Revealed", value: "Nothing — only the proof validity" },
                { label: "Verification Time", value: "< 5ms" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-white/35">{r.label}</span>
                  <span className="font-mono text-white/65">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* SDK Integration */}
        <SectionCard title="Issuing a NeoID Credential" accent="#10b981">
          <pre className="p-4 rounded-xl text-[11px] font-mono text-white/70 overflow-x-auto" style={{ background: "#080809", border: "1px solid #ffffff08" }}>
{`// Issue a Verifiable Credential to a NeoID DID
const credential = await nfl.neoid.issueCredential({
  subjectDid: 'did:neo:zQmYUF4N9bPkKAM7...',
  type: ['VerifiableCredential', 'AgeVerificationCredential'],
  claims: {
    ageOver18: true,
    verifiedAt: '2026-07-01T00:47:58Z',
    issuer: 'did:neo:issuer_govdb_01'
  },
  expiresAt: '2027-07-01T00:00:00Z'
});

console.log(credential.jwt);  // signed JWT VC
console.log(credential.id);   // vc_01JYNXKGM4ZQC`}
          </pre>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
