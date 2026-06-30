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
            Developer Hub
          </div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-white mb-3 leading-snug">
            Video &{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #00C2FF, #00E5A8)" }}>
              Code Tutorials
            </span>
          </h1>
          <p className="text-[12.5px] text-white/50 leading-relaxed max-w-2xl">
            Hands-on, step-by-step tutorials for building with NeoFace. Each tutorial includes
            a code repository, annotated walkthrough, and a video recording of the implementation.
          </p>
        </div>

        {/* Getting Started Series */}
        <SectionCard title="Getting Started Series" accent="#00C2FF">
          <div className="space-y-3">
            {[
              {
                num: "01",
                title: "Your First Biometric Verification",
                duration: "8 min",
                level: "Beginner",
                desc: "Install the SDK, create an API key, enroll a test identity, and run your first live verification against the sandbox environment.",
                color: "#10b981",
              },
              {
                num: "02",
                title: "Enrollment UI from Scratch",
                duration: "12 min",
                level: "Beginner",
                desc: "Build a camera capture modal in React with real-time face detection feedback, user consent gate, and enrollment success state.",
                color: "#10b981",
              },
              {
                num: "03",
                title: "Handling Verification Outcomes",
                duration: "10 min",
                level: "Beginner",
                desc: "Process trust scores, handle failure reasons (liveness_failed, template_mismatch), and implement retry logic with exponential backoff.",
                color: "#10b981",
              },
            ].map((t) => (
              <div key={t.num} className="p-4 rounded-xl border flex items-start gap-4" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="font-mono text-[10px] text-white/20 mt-1 shrink-0">{t.num}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-[12px] font-semibold text-white">{t.title}</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border" style={{ color: t.color, borderColor: `${t.color}30`, background: `${t.color}10` }}>{t.level}</span>
                  </div>
                  <p className="text-[11.5px] text-white/45 leading-relaxed mb-2">{t.desc}</p>
                  <span className="font-mono text-[10px] text-white/25">⏱ {t.duration} walkthrough</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Framework Tutorials */}
        <SectionCard title="Framework-Specific Builds" accent="#00E5A8">
          <div className="space-y-3">
            {[
              {
                num: "04",
                title: "Next.js App Router: Protected Routes with Biometrics",
                duration: "18 min",
                level: "Intermediate",
                desc: "Implement biometric-gated route middleware in Next.js 14. Covers server-side session validation, middleware auth checks, and client-side camera capture modal.",
                color: "#3b82f6",
                tags: ["Next.js", "TypeScript", "App Router"],
              },
              {
                num: "05",
                title: "React Native: Face ID + NeoFace Hybrid Verification",
                duration: "22 min",
                level: "Intermediate",
                desc: "Combine native iOS Face ID with NeoFace's cloud liveness check. Covers Expo Camera, secure storage for identity tokens, and offline-first fallback mode.",
                color: "#3b82f6",
                tags: ["React Native", "Expo", "iOS"],
              },
              {
                num: "06",
                title: "FastAPI: Identity Management Microservice",
                duration: "20 min",
                level: "Intermediate",
                desc: "Build a Python microservice that handles enrollment, verification, and identity deletion with async endpoints, webhook processing, and Redis-backed session storage.",
                color: "#3b82f6",
                tags: ["Python", "FastAPI", "Redis"],
              },
              {
                num: "07",
                title: "Flutter: Universal Biometric Auth Module",
                duration: "25 min",
                level: "Intermediate",
                desc: "Create a reusable NeoFace authentication module for Flutter apps targeting iOS and Android. Platform channel implementation for native hardware sensor access.",
                color: "#3b82f6",
                tags: ["Flutter", "Dart", "iOS", "Android"],
              },
            ].map((t) => (
              <div key={t.num} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-mono text-[9.5px] text-white/20 mt-0.5 shrink-0">{t.num}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-[12px] font-semibold text-white">{t.title}</h3>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border" style={{ color: t.color, borderColor: `${t.color}30`, background: `${t.color}10` }}>{t.level}</span>
                      <span className="font-mono text-[9.5px] text-white/25">⏱ {t.duration}</span>
                    </div>
                    <p className="text-[11.5px] text-white/45 leading-relaxed mb-2.5">{t.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag) => (
                        <span key={tag} className="text-[9.5px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: "#ffffff0c", color: "#ffffff45", background: "#ffffff05" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Advanced Tutorials */}
        <SectionCard title="Advanced Scenarios" accent="#a78bfa">
          <div className="space-y-3">
            {[
              {
                num: "08",
                title: "Step-Up Authentication for High-Risk Actions",
                duration: "15 min",
                level: "Advanced",
                desc: "Trigger biometric re-verification before wire transfers or sensitive data access. Implement scoped step-up tokens that expire after a single use.",
                color: "#a78bfa",
              },
              {
                num: "09",
                title: "Multi-Tenant Biometric Isolation with Organizations",
                duration: "20 min",
                level: "Advanced",
                desc: "Set up a multi-tenant SaaS architecture where each customer has isolated identity namespaces, separate audit trails, and independent webhook configurations.",
                color: "#a78bfa",
              },
              {
                num: "10",
                title: "Building a GDPR-Compliant Enrollment Flow",
                duration: "18 min",
                level: "Advanced",
                desc: "Design a full consent capture, disclosure, and enrollment flow that satisfies GDPR Article 9 biometric data processing requirements, with audit-ready consent logs.",
                color: "#a78bfa",
              },
            ].map((t) => (
              <div key={t.num} className="p-4 rounded-xl border flex items-start gap-3" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <span className="font-mono text-[9.5px] text-white/20 mt-0.5 shrink-0">{t.num}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-[12px] font-semibold text-white">{t.title}</h3>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border" style={{ color: t.color, borderColor: `${t.color}30`, background: `${t.color}10` }}>{t.level}</span>
                    <span className="font-mono text-[9.5px] text-white/25">⏱ {t.duration}</span>
                  </div>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Sample Repos */}
        <SectionCard title="Open Source Sample Repositories" accent="#f59e0b">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "neoface-nextjs-starter", lang: "TypeScript", stars: "1.2k", desc: "Production-ready Next.js template with NeoFace auth, protected routes, and dashboard." },
              { name: "neoface-rn-demo", lang: "React Native", stars: "840", desc: "Expo demo app with camera enrollment, verification flow, and session management." },
              { name: "neoface-fastapi-template", lang: "Python", stars: "620", desc: "FastAPI microservice template with webhook handlers, async enrollment, and Redis sessions." },
              { name: "neoface-flutter-example", lang: "Dart", stars: "510", desc: "Flutter example with iOS/Android biometric integration and offline token support." },
            ].map((r) => (
              <div key={r.name} className="p-4 rounded-xl border" style={{ borderColor: "#ffffff07", background: "#0a0a0c" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <code className="font-mono text-[11px] text-amber-400">{r.name}</code>
                  <span className="font-mono text-[9.5px] text-white/30">★ {r.stars}</span>
                </div>
                <span className="text-[9.5px] font-mono text-white/25 block mb-1">{r.lang}</span>
                <p className="text-[11px] text-white/40">{r.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </SubpageLayout>
  );
}
