"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How accurate is NeoFace's face recognition?",
    a: "NeoFace uses ArcFace 512-d embeddings via InsightFace, achieving 99.83% accuracy on the LFW benchmark. In production environments with controlled lighting, accuracy typically exceeds 99.5%. Liveness detection adds an additional layer of spoof protection.",
  },
  {
    q: "Does NeoFace work without storing raw face images?",
    a: "Yes. NeoFace generates a 512-dimensional mathematical embedding from your image and immediately discards the raw pixel data. This is not a reversible process — the original image cannot be reconstructed from the embedding, giving you biometric security without raw image storage.",
  },
  {
    q: "What browsers and platforms support fingerprint/WebAuthn?",
    a: "WebAuthn (FIDO2) is supported on Chrome 67+, Firefox 60+, Safari 14+, Edge 18+, and all modern mobile browsers when hardware authenticators are present. NeoFace detects device capability and gracefully falls back with a clear 'Not Supported on This Device' message.",
  },
  {
    q: "How does liveness detection prevent spoofing?",
    a: "NeoFace's passive liveness pipeline uses a multi-signal approach: depth analysis, texture analysis (MiniFASNet), deepfake detection (EfficientNet), and 3D headpose estimation. This catches printed photos, video replays, screen spoofs, and 3D masks without requiring the user to perform any active challenge.",
  },
  {
    q: "Is NeoFace GDPR compliant?",
    a: "NeoFace is designed with privacy-by-default principles. Biometric data is stored as irreversible embeddings (not raw images), all data is encrypted at rest using AES-256-GCM, and in transit using TLS 1.3. We support data deletion and export requests. Our infrastructure is hosted in EU regions for EU customers on request.",
  },
  {
    q: "How do I integrate NeoFace into my existing application?",
    a: "Integration takes under 10 minutes. Generate API keys in the dashboard, call the enrollment endpoint to register users, and call the verification endpoint for subsequent authentications. SDKs are available for Python, Node.js, React, and Flutter. See our SDK Playground for interactive testing.",
  },
  {
    q: "What is the Trust Engine?",
    a: "The Trust Engine is a risk scoring system that combines device fingerprinting, IP intelligence, behavioral biometrics, impossible travel detection, and session analysis to produce a 0-100 risk score for each authentication event. High-risk sessions can trigger step-up authentication or be blocked.",
  },
  {
    q: "Can I self-host NeoFace?",
    a: "Enterprise customers can request on-premise or private cloud deployment options. Contact our sales team to discuss your infrastructure requirements. The full backend is Docker-ready and includes a Makefile with development and production profiles.",
  },
  {
    q: "What happens to my data if I exceed my plan limits?",
    a: "On the Starter plan, requests beyond 1,000/month return a 429 rate limit response — your application continues to work, just with reduced throughput. You'll receive an email notification before reaching your limit. Upgrading takes effect immediately.",
  },
  {
    q: "How are webhooks signed and secured?",
    a: "Webhook payloads are signed using HMAC-SHA256 with a per-endpoint signing secret. The signature is included in the `X-NeoFace-Signature` header. Your application should verify this signature before processing events. Signing secrets can be rotated in the dashboard at any time.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32 px-6 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full opacity-8"
          style={{ background: "radial-gradient(ellipse, #00E5A8, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase mb-6"
            style={{ background: "rgba(0,229,168,0.06)", border: "1px solid rgba(0,229,168,0.15)", color: "#00E5A8" }}>
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Everything you need to know
          </h2>
          <p className="text-[rgba(255,255,255,0.45)] text-lg">
            Can't find what you're looking for? <a href="mailto:support@neoface.io" className="text-[#00E5A8] hover:underline">Ask us directly.</a>
          </p>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: open === i ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                border: open === i ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.2s ease",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="text-[14px] font-medium" style={{ color: open === i ? "#fff" : "rgba(255,255,255,0.65)" }}>
                  {faq.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: open === i ? "rgba(0,194,255,0.12)" : "rgba(255,255,255,0.05)",
                    color: open === i ? "#00C2FF" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {open === i ? <Minus size={12} /> : <Plus size={12} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
