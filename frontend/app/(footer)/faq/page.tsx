"use client";
import React from "react";
import SubpageLayout from "../../components/SubpageLayout";

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

const Q = ({ question, answer }: { question: string; answer: string }) => (
  <div className="border-b pb-5" style={{ borderColor: "#ffffff07" }}>
    <h3 className="text-[12px] font-semibold text-white mb-2">{question}</h3>
    <p className="text-[11.5px] text-white/45 leading-relaxed">{answer}</p>
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
            FAQ
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #00C2FF)" }}>
              Questions
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Answers to the most common questions about NeoFace biometric authentication — 
            from data privacy and security architecture to pricing, compliance, and SDK integration.
          </p>
        </div>

        {/* Privacy & Data */}
        <SectionCard title="Data Privacy & Storage" accent="#a78bfa">
          <div className="space-y-5">
            <Q
              question="Does NeoFace store raw biometric photos or videos?"
              answer="No. Raw camera frames are processed on-device using our SDK to extract a mathematical geometric descriptor. The original image is immediately discarded. Only the encrypted descriptor hash is transmitted to our servers — and that hash cannot be reverse-engineered back into the original image."
            />
            <Q
              question="Where does biometric template matching happen?"
              answer="All matching logic runs inside hardware-isolated Trusted Execution Environments (TEEs) — specifically AWS Nitro Enclaves and Intel SGX. These enclaves have no persistent disk access, no outbound network connections, and no ability for any operator (including NeoFace employees) to access the memory contents."
            />
            <Q
              question="Can NeoFace employees see my users' biometric data?"
              answer="No. This is architecturally impossible, not just a policy. The enclave memory space is cryptographically sealed. Even NeoFace SREs with full infrastructure access cannot read enclave RAM. All they can see is the boolean result (verified: true/false) and the trust score."
            />
            <Q
              question="How do I delete a user's biometric data?"
              answer="Call DELETE /v1/identities/:identity_id. The enclave destroys the template immediately and the corresponding database record is purged within 60 seconds. This satisfies GDPR's right to erasure requirement."
            />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security Architecture" accent="#00E5A8">
          <div className="space-y-5">
            <Q
              question="What prevents someone from replaying a biometric capture?"
              answer="Every verification session generates a one-time nonce included in the signed challenge. The SDK binds the biometric capture to this session-specific nonce. Replaying a captured video or image from a different session will fail the nonce check before even reaching the enclave."
            />
            <Q
              question="How does NeoFace detect deepfakes and injection attacks?"
              answer="The Trust Engine applies multi-layer checks: passive liveness analysis detects flat printed surfaces and screens, infrared reflectance analysis rejects silicone masks, and our camera pipeline monitors for virtual device injection by verifying camera attestation signals at the hardware level."
            />
            <Q
              question="Is NeoFace SOC 2 compliant?"
              answer="Yes. We hold a current SOC 2 Type II certification audited by Ernst & Young. The audit covers Security, Availability, and Confidentiality trust service criteria. Enterprise customers can receive a copy of the report under NDA."
            />
          </div>
        </SectionCard>

        {/* Pricing & Billing */}
        <SectionCard title="Pricing & Billing" accent="#f59e0b">
          <div className="space-y-5">
            <Q
              question="What counts as a 'verification' for billing purposes?"
              answer="A verification is counted each time a biometric sample is submitted to the /v1/identities/verify endpoint, regardless of the outcome (success or failure). Enrollment calls (/v1/identities/enroll) are not counted as verifications and are billed separately on Pro+ plans."
            />
            <Q
              question="Can I test for free before committing to a plan?"
              answer="Yes. The Free tier gives you 5,000 verifications/month at no cost with no credit card required. You also get access to the full Sandbox environment with mock biometric data for unlimited testing."
            />
            <Q
              question="What happens if I exceed my monthly verification limit?"
              answer="Verifications continue to process normally — we do not cut off your service. Overages are billed at the end of the month at your tier's per-verification overage rate. You can set usage alerts in the Dashboard to get notified before exceeding your limit."
            />
          </div>
        </SectionCard>

        {/* Integration */}
        <SectionCard title="Integration & SDKs" accent="#3b82f6">
          <div className="space-y-5">
            <Q
              question="Which programming languages does NeoFace support?"
              answer="We have official SDKs for TypeScript/JavaScript, Python, Go, React Native, Flutter, Swift (iOS), and Kotlin (Android). All SDKs are open-source on GitHub and follow semantic versioning. Community-maintained bindings exist for Ruby and PHP."
            />
            <Q
              question="Can NeoFace work without a camera? For example, with existing ID documents?"
              answer="NeoFace is a live biometric platform — it requires a camera for active face or iris capture. Document identity verification (ID + selfie matching) is available as a premium add-on through our Document Intelligence module, which uses OCR + face geometry comparison."
            />
            <Q
              question="Does NeoFace work on mobile browsers or only native apps?"
              answer="NeoFace works in both web browsers (via WebRTC camera APIs) and native mobile apps. Browser support covers Chrome 88+, Firefox 87+, Safari 14.1+, and Edge 88+. Mobile SDK wrappers provide access to hardware sensor integrations (Face ID, Touch ID) not available via browsers."
            />
          </div>
        </SectionCard>

        {/* Compliance */}
        <SectionCard title="Regulatory Compliance" accent="#10b981">
          <div className="space-y-5">
            <Q
              question="Is NeoFace compliant with the Illinois BIPA?"
              answer="NeoFace's architecture is designed to help customers achieve BIPA compliance. Key requirements: biometric identifiers are not stored in raw form, retention schedules are configurable and enforceable, and deletion mechanisms are provided. Customers remain responsible for their own consent collection and disclosure obligations."
            />
            <Q
              question="Can NeoFace be deployed in the EU under GDPR?"
              answer="Yes. We operate an EU-dedicated enclave region in Dublin, Ireland (eu-west-1). Data Processing Agreements (DPAs) are available to all paying customers. Biometric data stays within EU infrastructure and no cross-border transfers occur without your explicit configuration."
            />
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
