"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  Shield,
  Settings,
  User,
  Code,
  Terminal,
  Activity,
  Lock,
  Layers,
  Server,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  Database,
  Globe,
  Cpu,
  Key,
  Copy,
  Play,
  Download,
  BookOpen,
  Calendar,
  AlertTriangle,
  Monitor,
  Eye,
  FileCode,
  Users,
  Vault,
  Dna,
  Landmark,
  GraduationCap,
  Network
} from "lucide-react";

import { MenuBar } from "./components/ui/glow-menu";
import { BorderGlow } from "./components/ui/BorderGlow";
import { CountUp } from "./components/ui/CountUp";
import { RevealOnScroll } from "./components/ui/RevealOnScroll";
import { MagneticButton } from "./components/ui/MagneticButton";
import { ScrollSequence } from "./components/ui/ScrollSequence";
import { Footer } from "./components/Footer";

import { LogoBar, TrustBadges, Testimonials, BlogTeaser } from "./components/PremiumSections";
import { useAuthStore } from "@/store/auth";

const menuItems = [
  {
    icon: HomeIcon,
    label: "Home",
    href: "/",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: Shield,
    label: "Features",
    href: "/features",
    gradient: "radial-gradient(circle, rgba(0,229,168,0.15) 0%, rgba(0,229,168,0.06) 50%, rgba(0,229,168,0) 100%)",
    iconColor: "text-emerald-400",
  },
  {
    icon: Settings,
    label: "Pricing",
    href: "/pricing",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: User,
    label: "About",
    href: "/about",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
];

// FAQS (15 questions)
const FAQS = [
  { q: "How does NeoFace prevent photo spoofing?", a: "NeoFace uses multi-spectral passive liveness detection. Our models capture and analyze sub-millimeter texture differences, micro-motions, and dynamic reflection maps to immediately filter out phone displays, printed sheets, and 3D silicone masks." },
  { q: "Where is the biometric database stored?", a: "Nowhere. NeoFace compiles face and iris data into cryptographic zero-knowledge hashes inside local secure enclaves. The original templates are never uploaded, stored, or visible to our cloud servers." },
  { q: "Is NeoFace GDPR and CCPA compliant?", a: "Yes. Biometric templates stay entirely on the user's local device hardware (such as Apple's Secure Enclave). Centralized servers store zero templates, satisfying data residency guidelines." },
  { q: "What is the average latency of the verification API?", a: "Under ordinary network conditions, local liveness processing takes 60ms, and the zero-knowledge verification round-trip takes under 120ms, leading to a total response latency below 200ms." },
  { q: "Can we self-host or run on-premises?", a: "Yes. NeoFace provides localized Docker enclaves that fit with private Kubernetes clusters, enabling banks and governments to authenticate offline." },
  { q: "Do you support fingerprint scanners too?", a: "Yes, our FIDO2/WebAuthn engine supports fingerprint readers, Touch ID, Windows Hello, and native biometric enclaves on all modern mobile devices." },
  { q: "Does the model drift with age, glasses, or facial hair?", a: "No. The verification algorithm maps structural landmark coordinates rather than surface textures. It accommodates modifications like glasses, makeup, aging, and beard growth." },
  { q: "How does the Deepfake Shield work?", a: "The neural texture scanner evaluates frame metadata on every intake layer, detecting pixel distortion, light mismatch, and boundary inconsistencies common in synthetic media generators." },
  { q: "Can we customize the security risk thresholds?", a: "Yes. Developers can configure risk engines via console policies or JSON rules (e.g., denying sessions with a liveness confidence score below 98%)." },
  { q: "Does NeoFace support WebAuthn?", a: "Yes, we are fully WebAuthn and FIDO2 certified. We bridge raw biometric templates with standard cryptographic signature flows out-of-the-box." },
  { q: "What happens if a user is offline?", a: "Our iOS and Android SDKs support localized offline verification. Biometrics are matched against local Secure Enclave keys and queued for verification sync." },
  { q: "Are there daily transaction limits?", a: "Our developer tier supports up to 10 requests per second. Enterprise licenses have uncapped, high-throughput scaling capacities verified for 500+ requests per second." },
  { q: "How do you defend against SIM-swapping or OTP intercept?", a: "By replacing SMS and app OTP codes with device-bound biometric hashes, there are no static codes or communication channels for attackers to intercept." },
  { q: "Does NeoFace work on older mobile phones?", a: "Yes, our lightweight SDK operates on iOS 14+ and Android 8+ using standard device cameras and local acceleration layers." },
  { q: "What level of support do you offer developers?", a: "We provide detailed Slack/Discord developer support channels, extensive OpenAPI references, and dedicated solution architects for enterprise onboarding." }
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [activeNav, setActiveNav] = useState("Home");
  const [activeTab, setActiveTab] = useState<"install" | "verify" | "response">("verify");
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Group Refs for scroll sequence animations (1 video sequence : 2 continuous sections)
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const group3Ref = useRef<HTMLDivElement>(null);
  const group4Ref = useRef<HTMLDivElement>(null);
  const group5Ref = useRef<HTMLDivElement>(null);
  const group6Ref = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full relative min-h-screen bg-transparent text-[#f5f5f5] overflow-x-hidden selection:bg-white selection:text-black">

      {/* ── Global Animated Gradient Mesh Background ── */}
      <div className="animated-gradient-mesh" />

      {/* ── Header Floating Glass Pill Navbar ── */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-[999] backdrop-blur-[20px] bg-black/40 border border-white/[0.08] rounded-full p-2"
      >
        <div className="px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative group flex items-center">
            <img
              src="/newlogo.png"
              alt="NeoFace Labs"
              className="h-7 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className="hidden md:block">
            <MenuBar
              items={menuItems}
              activeItem={activeNav}
              onItemClick={setActiveNav}
            />
          </div>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="relative overflow-hidden group inline-flex items-center justify-center px-5 py-2.5 bg-white/10 rounded-full text-[10.5px] font-mono tracking-wider uppercase transition-all duration-300 border border-white/10 hover:border-[#00E5A8]/50"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-black font-semibold">Dashboard</span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-[#00E5A8] to-[#00C2FF] scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left" />
            </Link>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-[11px] font-mono tracking-wider uppercase text-white/60 hover:text-white transition-colors font-semibold px-2 py-1"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="relative overflow-hidden group inline-flex items-center justify-center px-5 py-2.5 bg-white/10 rounded-full text-[10.5px] font-mono tracking-wider uppercase transition-all duration-300 border border-white/10 hover:border-[#00E5A8]/50"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-black font-semibold">Sign Up</span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-[#00E5A8] to-[#00C2FF] scale-x-0 origin-right transition-transform duration-500 ease-out group-hover:scale-x-100 group-hover:origin-left" />
              </Link>
            </div>
          )}
        </div>
      </motion.header>

      {/* ── Group 1: Hero Section + Built for High-Trust Sectors (Sequence 1) ── */}
      <div ref={group1Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video1"
          frameCount={201}
          sectionRef={group1Ref}
          opacity={0.35}
          overlayOpacity={0.3}
        />

        {/* ── 1. Hero Section ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 overflow-hidden bg-transparent">
          {/* Subtle background glow highlight */}
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#10b981]/10 via-[#22d3ee]/5 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

          <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center justify-center">

            {/* Centered copy section */}
            <div className="max-w-4xl mx-auto space-y-8 text-center flex flex-col items-center justify-center">
              <RevealOnScroll staggerChildren={0.1}>
                <div className="inline-flex items-center gap-2 mb-2 justify-center">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    The Identity Layer for the Next Internet
                  </span>
                </div>

                <h1 className="text-[42px] sm:text-[62px] md:text-[80px] font-black tracking-tight leading-[0.9] text-white text-center">
                  Authenticate Humans. <br />
                  <span className="glow-shimmer-text py-2 block">Not Passwords.</span>
                </h1>

                <p className="text-[14.5px] sm:text-[17px] text-white/60 leading-relaxed font-light max-w-2xl mx-auto text-center font-sans mt-4">
                  NeoFace provides enterprise-grade biometric authentication APIs for face verification, passive liveness detection, fraud prevention, and identity intelligence—all through a developer-first platform built for modern applications.
                </p>

                {/* Three Magnetic CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-5 pt-8">
                  <MagneticButton className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#22d3ee] text-black font-bold text-[11px] tracking-wider uppercase rounded-full hover:scale-105 hover:opacity-95 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300">
                    <Link href="/login">Get API Keys</Link>
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 border border-white/15 hover:border-white/35 bg-white/[0.03] text-white font-semibold text-[11px] tracking-wider uppercase rounded-full hover:scale-105 transition-all duration-300 backdrop-blur-md">
                    <Link href="/features">View Live Demo</Link>
                  </MagneticButton>
                  <MagneticButton className="px-8 py-4 text-white/50 hover:text-white font-medium text-[11px] tracking-wider uppercase rounded-full transition-all duration-300">
                    <Link href="/about">Read Documentation</Link>
                  </MagneticButton>
                </div>

                {/* Trust badges marquee strip */}
                <div className="pt-16 mt-16 border-t border-white/[0.07] grid grid-cols-3 sm:grid-cols-6 gap-8 font-mono text-[10px] text-[#9ca3af] justify-center max-w-4xl mx-auto">
                  {[
                    { label: "SOC2 Ready", val: "Compliance" },
                    { label: "GDPR", val: "Compliant" },
                    { label: "ISO 27001", val: "Certified" },
                    { label: "99.98%", val: "API Uptime" },
                    { label: "<200ms", val: "Latency" },
                    { label: "256-bit", val: "Encryption" }
                  ].map((item, idx) => (
                    <div key={idx} className="hover:text-white transition-colors duration-300">
                      <div className="font-extrabold text-white text-[12px] mb-0.5">{item.label}</div>
                      <div className="text-[8px] text-white/35 tracking-widest uppercase font-semibold">{item.val}</div>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>

          </div>
        </section>

        {/* ── 2. Built for High-Trust Sectors ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          {/* Scope custom 3D card styles for landing page sectors */}



          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#22d3ee] block mb-4">
                Market Solutions
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                Built for High-Trust Sectors.
              </h2>
            </div>

            <RevealOnScroll staggerChildren={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Developers", desc: "Add biometric authentication to Next.js, React Native, or Flutter apps in minutes using our lightweight SDKs.", iconSrc: "/Icons/Developers.png", accent: "#00C2FF", glowHsl: "194 100 50" },
                { title: "Banks", desc: "Prevent identity fraud, deepfakes, and account takeovers with enterprise-grade cryptographic validation layers.", iconSrc: "/Icons/Bank.png", accent: "#10b981", glowHsl: "160 85 45" },
                { title: "Healthcare", desc: "Secure patient verification and medical record access while staying fully HIPAA and regional compliant.", iconSrc: "/Icons/Healthcare.png", accent: "#f43f5e", glowHsl: "350 90 60" },
                { title: "Government", desc: "Issue and protect digital citizen identities with decentralized, zero-knowledge multi-modal biometrics.", iconSrc: "/Icons/Government.png", accent: "#a78bfa", glowHsl: "258 90 75" },
                { title: "Universities", desc: "Manage classroom attendance, examinations, and campus credential authentication seamlessly.", iconSrc: "/Icons/Universities.png", accent: "#3b82f6", glowHsl: "217 90 60" },
                { title: "Enterprises", desc: "Implement secure workforce access, eliminate credentials, and establish standard Zero-Trust logins.", iconSrc: "/Icons/Enterprises.png", accent: "#f59e0b", glowHsl: "38 90 55" }
              ].map((sector, idx) => {
                const gradient = `linear-gradient(90deg, transparent, ${sector.accent}, ${sector.accent}, transparent)`;

                 return (
                  <motion.div key={idx} className="trust-sector-card">
                    <div className="trust-sector-card-content">
                      
                      {/* Back (Unhovered View: Ambient glow backdrop + Icon) */}
                      <div className="trust-sector-card-back" style={{ "--glow-gradient": gradient } as React.CSSProperties}>
                        <div className="trust-sector-card-back-inner flex items-center justify-center">
                          {/* Ambient Soft Glow Backdrop */}
                          <div 
                            className="absolute w-[200px] h-[200px] rounded-full blur-[50px] opacity-25 pointer-events-none" 
                            style={{ backgroundColor: sector.accent }} 
                          />
                          
                          {/* Giant 3D PNG Illustration */}
                          <img 
                            src={sector.iconSrc} 
                            alt={sector.title} 
                            className="w-80 h-80 object-contain relative z-20 transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                      </div>

                      {/* Front (Hovered View: Spacious description specifications) */}
                      <div className="trust-sector-card-front">
                        <div className="p-7 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between mb-4.5">
                              <div className="font-mono font-bold uppercase tracking-[0.15em] px-3.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05]" style={{ fontSize: '9.5px', color: sector.accent }}>
                                SECURE_STACK
                              </div>
                              <img src={sector.iconSrc} alt={sector.title} className="w-8 h-8 object-contain" />
                            </div>
                            
                            <div className="font-black text-white tracking-tight leading-tight mb-2.5" style={{ fontSize: '23px', lineHeight: '1.2' }}>
                              {sector.title}
                            </div>
                            
                            <p className="font-sans font-light leading-relaxed text-white/75" style={{ fontSize: '15px', lineHeight: '1.55' }}>
                              {sector.desc}
                            </p>
                          </div>

                          <div>
                            <div className="w-full h-px bg-white/5 mb-3.5" />
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-white/20" style={{ fontSize: '10px' }}>NFL_SECTOR_VERIFY</span>
                              <a href="/pricing" className="font-bold text-white hover:text-[#00E5A8] transition-colors flex items-center gap-1 font-sans" style={{ fontSize: '12.5px' }}>
                                Explore Solution
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </RevealOnScroll>
          </div>
        </section>
      </div>

      {/* ── Group 2: Platform Features + Autonomous Liveness (Sequence 2) ── */}
      <div ref={group2Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video2"
          frameCount={201}
          sectionRef={group2Ref}
          opacity={0.25}
          overlayOpacity={0.4}
        />

        {/* ── 3. Multi-modal Section ("One Platform. Every Identity Signal.") ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#10b981] block mb-4">
                Platform Features
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                One Platform. <br />Every Identity Signal.
              </h2>
            </div>

            <RevealOnScroll staggerChildren={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
              {[
                {
                  title: "Face Verification",
                  desc: "Process and verify facial landmark coordinates instantly inside Secure Enclaves.",
                  borderRadius: "3.25rem 12px 3.25rem 12px",
                  color: "text-[#10b981]",
                  accent: "#10b981",
                  glowHsl: "160 85 45",
                  icon: Eye
                },
                {
                  title: "Passive Liveness",
                  desc: "Verify real human existence silently without requiring blinking, smiling, or user prompts.",
                  borderRadius: "12px 4.5rem 12px 4.5rem",
                  color: "text-[#22d3ee]",
                  accent: "#22d3ee",
                  glowHsl: "194 100 50",
                  icon: Shield
                },
                {
                  title: "Deepfake Shield",
                  desc: "Scan image pixels and light reflection layers to intercept AI-generated synthetics before validation.",
                  borderRadius: "12px 4.5rem 12px 4.5rem",
                  color: "text-[#10b981]",
                  accent: "#10b981",
                  glowHsl: "160 85 45",
                  icon: AlertTriangle
                },
                {
                  title: "Device Trust",
                  desc: "Check hardware integrity, secure enclave availability, and device security profiles in real-time.",
                  borderRadius: "2.5rem 2.5rem 10px 2.5rem",
                  color: "text-[#22d3ee]",
                  accent: "#22d3ee",
                  glowHsl: "194 100 50",
                  icon: Monitor
                }
              ].map((sig, idx) => {
                const Icon = sig.icon;

                return (
                  <motion.div key={idx} className="h-full flex flex-col">
                    <BorderGlow
                      className="h-full transition-all duration-500 hover:-translate-y-1"
                      edgeSensitivity={25}
                      glowColor={sig.glowHsl}
                      backgroundColor="#09090b"
                      borderRadius={sig.borderRadius}
                      glowRadius={45}
                      glowIntensity={0.8}
                      colors={[sig.accent, `${sig.accent}88`, '#050505']}
                      fillOpacity={0.15}
                    >
                      <div className="p-9 flex flex-col justify-between h-full relative z-10 min-h-[180px]">
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <div className={`p-3 bg-white/[0.03] border border-white/[0.08] w-fit rounded-2xl ${sig.color} shadow-inner`}>
                              <Icon className="w-5.5 h-5.5" />
                            </div>
                            <span className="font-mono text-[10px] text-white/20 transition-colors duration-300 font-bold">0{idx + 1}</span>
                          </div>
                          <h4 className="text-[16px] font-extrabold text-white transition-colors duration-300 mb-3">{sig.title}</h4>
                          <p className="text-[13px] text-white/50 leading-relaxed font-light font-sans">{sig.desc}</p>
                        </div>
                      </div>
                    </BorderGlow>
                  </motion.div>
                );
              })}
            </RevealOnScroll>
          </div>
        </section>


      </div>

      {/* ── Group 3: Performance That Matters + Timeline Pipeline (Sequence 3) ── */}
      <div ref={group3Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video3"
          frameCount={201}
          sectionRef={group3Ref}
          opacity={0.22}
          overlayOpacity={0.4}
        />

        {/* ── 5. Accuracy / Performance Section ("Performance That Matters") ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 text-center">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#10b981] block mb-4">
              Security Benchmarks
            </span>
            <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white mb-20 tracking-tight">
              Performance That Matters
            </h2>

            <RevealOnScroll staggerChildren={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
              {[
                { val: 98.6, suffix: "%", title: "Verification Accuracy", desc: "High-accuracy biometric verification matching across diverse age groups and lighting.", decimals: 1, accent: "#10b981", glowHsl: "160 85 45" },
                { val: 150, prefix: "<", suffix: "ms", title: "Match Verification Latency", desc: "Optimized server enclaves and distributed APIs complete matches under 150ms.", accent: "#22d3ee", glowHsl: "194 100 50" },
                { val: 0.01, suffix: "%", title: "False Acceptance Rate (FAR)", desc: "Robust false acceptance rate blocking unauthorized access attempts.", decimals: 2, accent: "#a78bfa", glowHsl: "258 90 75" },
                { val: 99.9, suffix: "%", title: "Platform SLA Availability", desc: "High-availability SLA backing biometric API routing pathways.", decimals: 1, accent: "#10b981", glowHsl: "160 85 45" },
                { val: 150, suffix: "/s", title: "Peak Concurrency Limit", desc: "Reliable concurrent matcher sessions optimized for production launch volumes.", accent: "#22d3ee", glowHsl: "194 100 50" },
                { val: 256, prefix: "secp", suffix: "r1", title: "ECDSA Signature Proofs", desc: "All local enclave verification proofs are signed with 256-bit elliptic curves.", accent: "#a78bfa", glowHsl: "258 90 75" }
              ].map((stat, idx) => (
                <motion.div key={idx} className="h-full flex flex-col">
                  <BorderGlow
                    className="h-full transition-all duration-500 hover:-translate-y-1"
                    edgeSensitivity={25}
                    glowColor={stat.glowHsl}
                    backgroundColor="#09090b"
                    borderRadius={40}
                    glowRadius={45}
                    glowIntensity={0.8}
                    colors={[stat.accent, `${stat.accent}88`, '#050505']}
                    fillOpacity={0.15}
                  >
                    <div className="p-9 h-full flex flex-col justify-between relative z-10 min-h-[160px]">
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10b981] to-[#22d3ee] opacity-40 group-hover/card:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to right, ${stat.accent}, ${stat.accent}88)` }} />

                      <div className="text-[44px] font-black text-white mb-3 font-mono flex items-baseline tracking-tight">
                        <CountUp
                          end={stat.val}
                          decimals={stat.decimals || 0}
                          prefix={stat.prefix || ""}
                          suffix={stat.suffix || ""}
                        />
                      </div>
                      <h5 className="text-[14.5px] font-bold text-white mb-2">{stat.title}</h5>
                      <p className="text-[12.5px] text-white/45 leading-relaxed font-light font-sans">{stat.desc}</p>
                    </div>
                  </BorderGlow>
                </motion.div>
              ))}
            </RevealOnScroll>
          </div>
        </section>

        {/* ── 6. Enrollment → Verification Workflow Timeline ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/30 block mb-4">
                System Pipeline
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                Biometric Matching Lifecycle
              </h2>
            </div>

            {/* Alternating Winding Neon Timeline Trace Pipeline */}
            <div className="relative max-w-5xl mx-auto py-12">
              {/* Glowing vertical timeline center line */}
              <div className="absolute left-[30px] md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#10b981] via-[#22d3ee] to-transparent -translate-x-1/2" />

              <RevealOnScroll staggerChildren={0.06} className="space-y-12 relative z-10">
                {[
                  { num: "01", title: "Enroll Device", detail: "Initialize capture systems to gather multi-modal biometric sensor inputs.", side: "left" },
                  { num: "02", title: "Quality Validation", detail: "Filter motion blur and evaluate scan pixel contrast constraints.", side: "right" },
                  { num: "03", title: "Feature Extraction", detail: "Calculate numeric structural coordinates along matching landmarks.", side: "left" },
                  { num: "04", title: "Encrypted Templates", detail: "Lock biometric hashes within the device's local Secure Enclave.", side: "right" },
                  { num: "05", title: "Liveness Check", detail: "Verify real human texture vectors and filter camera feeds.", side: "left" },
                  { num: "06", title: "Zero-Knowledge Match", detail: "Perform biometric math checks without exposing original parameters.", side: "right" },
                  { num: "07", title: "Context Risk Evaluation", detail: "Assess device integrity, IP context, and telemetry security.", side: "left" },
                  { num: "08", title: "Access Token Issued", detail: "Generate and sign secure authenticated user session JSON Web Tokens.", side: "right" }
                ].map((step, idx) => {
                  const isLeft = step.side === "left";

                  return (
                    <div key={idx} className="relative flex flex-col md:flex-row items-center md:justify-between w-full">

                      {/* Left Block Space on Desktop */}
                      <div className={`w-full md:w-[45%] flex ${isLeft ? "md:justify-end" : "hidden md:flex"} pl-16 md:pl-0`}>
                        {isLeft && (
                          <div className="text-left md:text-right pr-0 md:pr-8 space-y-2">
                            <h4 className="text-[16px] font-extrabold text-white font-sans">{step.title}</h4>
                            <p className="text-[13px] text-white/50 leading-relaxed font-light font-sans max-w-md md:ml-auto">{step.detail}</p>
                          </div>
                        )}
                      </div>

                      {/* Timeline Center Point Badge */}
                      <div className="absolute left-[30px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black border-2 border-white/20 flex items-center justify-center text-white font-mono text-[11px] font-bold shadow-2xl group hover:border-[#10b981] hover:text-[#10b981] transition-all duration-300 z-20">
                        {step.num}
                      </div>

                      {/* Right Block Space on Desktop */}
                      <div className={`w-full md:w-[45%] flex ${!isLeft ? "md:justify-start" : "hidden md:flex"} pl-16 md:pl-8`}>
                        {!isLeft && (
                          <div className="text-left space-y-2">
                            <h4 className="text-[16px] font-extrabold text-white font-sans">{step.title}</h4>
                            <p className="text-[13px] text-white/50 leading-relaxed font-light font-sans max-w-md">{step.detail}</p>
                          </div>
                        )}
                      </div>

                      {/* Mobile-Only layout display mapping */}
                      <div className="md:hidden w-full pl-16 py-2">
                        <div className="text-left space-y-2">
                          <h4 className="text-[16px] font-extrabold text-white font-sans">{step.title}</h4>
                          <p className="text-[13px] text-white/50 leading-relaxed font-light font-sans">{step.detail}</p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </RevealOnScroll>
            </div>
          </div>
        </section>
      </div>

      {/* ── Group 4: Security Comparison + Developer Sandbox (Sequence 4) ── */}
      <div ref={group4Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video4"
          frameCount={200}
          sectionRef={group4Ref}
          opacity={0.22}
          overlayOpacity={0.4}
        />

        {/* ── 7. Liveness Comparison ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 text-center">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#22d3ee] block mb-4">
              Security Comparison
            </span>
            <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white mb-16 tracking-tight">
              NeoFace vs. Traditional Auth
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-4xl mx-auto items-stretch">

              {/* Vibrant neon glowing panel for NeoFace */}
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full flex flex-col"
              >
                <BorderGlow
                  className="h-full"
                  edgeSensitivity={25}
                  glowColor="160 85 45"
                  backgroundColor="#09090b"
                  borderRadius={48}
                  glowRadius={45}
                  glowIntensity={0.8}
                  colors={['#10b981', '#10b98188', '#050505']}
                  fillOpacity={0.15}
                >
                  <div className="p-10 flex flex-col justify-between h-full relative z-10">
                    <div>
                      <h4 className="text-[17px] font-extrabold text-[#10b981] mb-8 font-mono tracking-widest">NEOFACE LABS</h4>
                      <ul className="space-y-5 font-sans font-light text-[14px] text-white/80">
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> Passive sensor checking (No tasks required)</li>
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> Deepfake resistant neural texture filters</li>
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> No user actions or authentication prompts</li>
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> Hardened on-device template encryption</li>
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> Contextual device trust diagnostics</li>
                        <li className="flex items-center gap-4"><span className="text-[#10b981] font-bold bg-[#10b981]/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✔</span> Continuous background session validation</li>
                      </ul>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>

              {/* Faded historical table look for Traditional */}
              <motion.div
                whileHover={{ y: -6 }}
                className="h-full flex flex-col"
              >
                <BorderGlow
                  className="h-full"
                  edgeSensitivity={25}
                  glowColor="350 90 60"
                  backgroundColor="#09090b"
                  borderRadius={48}
                  glowRadius={45}
                  glowIntensity={0.6}
                  colors={['#f43f5e', '#be123c88', '#050505']}
                  fillOpacity={0.1}
                >
                  <div className="p-10 flex flex-col justify-between h-full relative z-10">
                    <div>
                      <h4 className="text-[17px] font-extrabold text-white/70 mb-8 font-mono tracking-widest">TRADITIONAL METHODS</h4>
                      <ul className="space-y-5 font-sans font-light text-[14px] text-white/75">
                        <li className="flex items-center gap-4"><span className="text-red-400 font-bold bg-red-400/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✖</span> Static, leaky passwords</li>
                        <li className="flex items-center gap-4"><span className="text-red-400 font-bold bg-red-400/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✖</span> SMS &amp; app OTP codes (SIM swap risk)</li>
                        <li className="flex items-center gap-4"><span className="text-red-400 font-bold bg-red-400/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✖</span> Plain static biometric database photos</li>
                        <li className="flex items-center gap-4"><span className="text-red-400 font-bold bg-red-400/10 w-6 h-6 flex items-center justify-center rounded-full text-[12px]">✖</span> Vulnerable single-login checkpoints</li>
                      </ul>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 8. Developer Section ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

              <div className="lg:col-span-5 space-y-7">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#10b981] block">
                  Developer First
                </span>
                <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                  Built for Developers. <br />Deployed in minutes.
                </h2>
                <p className="text-[14.5px] text-white/55 leading-relaxed font-light font-sans">
                  NeoFace SDK supports on-device liveness checks, WebAuthn flows, and backend verification with simple APIs.
                </p>

                <div className="flex flex-wrap gap-2.5 text-[9.5px] font-mono tracking-wider text-white/40 uppercase bg-white/[0.015] border border-white/[0.05] p-5 rounded-[1.75rem]">
                  {["REST APIs", "SDKs", "Next.js", "React", "Flutter", "Python", "Node", "Java", "Go", "Webhooks", "JWT", "OAuth", "OpenAPI"].map((tech) => (
                    <span key={tech} className="bg-white/[0.03] hover:text-white px-3.5 py-2 rounded-lg hover:bg-[#10b981]/15 transition-all duration-300 cursor-default border border-white/[0.05]">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-[2.5rem] border border-white/[0.12] bg-black/90 shadow-3xl overflow-hidden font-mono text-[13px] backdrop-blur-3xl">

                  <div className="bg-white/[0.015] border-b border-white/[0.06] px-6 py-4.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>

                    <div className="flex bg-white/[0.03] border border-white/[0.08] p-0.5 rounded-xl relative">
                      {["install", "verify", "response"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab as any);
                            setCopied(false);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-[10.5px] uppercase tracking-wider relative z-10 transition-colors duration-300 ${activeTab === tab ? "text-white font-semibold" : "text-white/40 hover:text-white/70"
                            }`}
                        >
                          {activeTab === tab && (
                            <motion.div
                              layoutId="tab-underline"
                              className="absolute inset-0 bg-white/[0.06] border border-white/[0.09] rounded-lg z-[-1]"
                            />
                          )}
                          {tab}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const txt = activeTab === "install" ? "npm install @neoface/sdk" : activeTab === "verify" ? `import { NeoFace } from "@neoface/sdk";\nconst res = await NeoFace.verify(factor);` : `{\n  "verified": true,\n  "confidence": 99.97,\n  "liveness": true\n}`;
                        navigator.clipboard.writeText(txt);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 text-white/45 hover:text-white transition-colors"
                    >
                      {copied ? <span className="text-[10px] text-[#10b981]">Copied</span> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-8 overflow-x-auto min-h-[180px] bg-neutral-950/60 leading-relaxed">
                    {activeTab === "install" && (
                      <code className="text-white/80"><span className="text-neutral-500">npm install</span> @neoface/sdk</code>
                    )}
                    {activeTab === "verify" && (
                      <code className="text-white/80 leading-relaxed block whitespace-pre">
                        {`import { NeoFace } from "@neoface/sdk";

// Perform on-device enclave biometric match
const response = await NeoFace.verify({
  userId: "usr_90210",
  factors: ["face", "liveness"]
});`}
                      </code>
                    )}
                    {activeTab === "response" && (
                      <code className="text-white/80 leading-relaxed block whitespace-pre">
                        {`{
  "verified": true,
  "confidence": 99.97,
  "liveness": true
}`}
                      </code>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ── Group 5: Enterprise Ready + Why NeoFace Exists (Sequence 5) ── */}
      <div ref={group5Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video5"
          frameCount={180}
          sectionRef={group5Ref}
          opacity={0.22}
          overlayOpacity={0.4}
        />

        {/* ── 9. Standards / Compliance ("Enterprise Ready") ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#22d3ee] block mb-4">
                Governance &amp; Controls
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                Enterprise Ready
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-[11.5px] uppercase tracking-widest text-center">
              {[
                { name: "SOC2", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "ISO27001", accent: "#10b981", glowHsl: "160 85 45" },
                { name: "GDPR", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "HIPAA", accent: "#10b981", glowHsl: "160 85 45" },
                { name: "PCI", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "CCPA", accent: "#10b981", glowHsl: "160 85 45" },
                { name: "Regional Data Residency", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "Audit Logs", accent: "#10b981", glowHsl: "160 85 45" },
                { name: "RBAC", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "SSO", accent: "#10b981", glowHsl: "160 85 45" },
                { name: "SCIM", accent: "#22d3ee", glowHsl: "194 100 50" },
                { name: "Bring Your Own Keys", accent: "#10b981", glowHsl: "160 85 45" }
              ].map((std, idx) => (
                <motion.div key={idx} className="h-full flex flex-col">
                  <BorderGlow
                    className="h-full transition-all duration-500 hover:-translate-y-1"
                    edgeSensitivity={20}
                    glowColor={std.glowHsl}
                    backgroundColor="#09090b"
                    borderRadius={32}
                    glowRadius={35}
                    glowIntensity={0.8}
                    colors={[std.accent, `${std.accent}88`, '#050505']}
                    fillOpacity={0.1}
                  >
                    <div className="p-8 flex items-center justify-center font-bold text-white/85 hover:text-white transition-colors duration-300 min-h-[90px] w-full text-center relative z-10">
                      {std.name}
                    </div>
                  </BorderGlow>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 13. Why NeoFace Exists ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#10b981] block mb-4">
                Philosophy
              </span>
              <h2 className="text-[28px] sm:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                Why NeoFace Exists
              </h2>
            </div>

            {/* Bento grid layout with dynamic curved shapes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {[
                { num: "01", q: "Passwords are broken.", a: "Static credentials cause 80%+ of modern breaches. Credential stuffing, phishing clones, and database dumps bypass traditional security layers instantly, leaving enterprises exposed.", wide: true, accent: "#22d3ee", glowHsl: "194 100 50" },
                { num: "02", q: "Bots and automation are increasing.", a: "Script attacks bypass traditional logins effortlessly. Automated credential intercept platforms exploit static forms, requiring dynamic sensory biometrics to verify actual human users.", accent: "#10b981", glowHsl: "160 85 45" },
                { num: "03", q: "AI generated identities are everywhere.", a: "Modern deepfakes produce synthetic face models in real-time, bypassing simple camera gates. Passive liveness and context checks are critical to verify human authenticity.", accent: "#a78bfa", glowHsl: "258 90 75" },
                { num: "04", q: "Identity should be continuous.", a: "Traditional login validates the user only at start-gate. Background continuous assessment is essential to defend active sessions from physical handovers.", wide: true, accent: "#22d3ee", glowHsl: "194 100 50" },
                { num: "05", q: "Developers shouldn't build from scratch.", a: "Packaging sub-millimeter biometric logic, secure enclave buffers, and model pipelines is incredibly complex. NeoFace encapsulates complete security into 5-line APIs.", accent: "#10b981", glowHsl: "160 85 45" }
              ].map((philosophy, idx) => {
                const bentoClass = philosophy.wide ? "md:col-span-2" : "";

                return (
                  <motion.div key={idx} className={`${bentoClass} h-full flex flex-col`}>
                    <BorderGlow
                      className="h-full transition-all duration-500 hover:-translate-y-1"
                      edgeSensitivity={25}
                      glowColor={philosophy.glowHsl}
                      backgroundColor="#09090b"
                      borderRadius={44}
                      glowRadius={45}
                      glowIntensity={0.8}
                      colors={[philosophy.accent, `${philosophy.accent}88`, '#050505']}
                      fillOpacity={0.15}
                    >
                      <div className="p-10 flex flex-col justify-between h-full relative z-10 min-h-[220px]">
                        <div className="absolute right-4 bottom-4 text-[120px] font-black opacity-[0.03] text-white font-mono pointer-events-none leading-none select-none">
                          {philosophy.num}
                        </div>
                        <div className="relative z-10">
                          <h4 className="text-[17px] font-extrabold text-white mb-4 font-mono">{philosophy.q}</h4>
                          <p className="text-[13.5px] text-white/50 leading-relaxed font-light font-sans">{philosophy.a}</p>
                        </div>
                      </div>
                    </BorderGlow>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── Group 6: FAQ + Manifesto (Sequence 6) ── */}
      <div ref={group6Ref} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video6"
          frameCount={201}
          sectionRef={group6Ref}
          opacity={0.22}
          overlayOpacity={0.4}
        />

        {/* ── FAQ Section (Accordion) ── */}
        <section className="py-12 border-t border-white/[0.04] relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#22d3ee] block mb-4">
                Q&amp;A
              </span>
              <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-[14px]">
              {/* Column 1 */}
              <div className="space-y-4">
                {FAQS.filter((_, idx) => idx % 2 === 0).map((faq, index) => {
                  const idx = index * 2;
                  const active = activeFaq === idx;

                  return (
                    <div
                      key={idx}
                      className={`border border-white/[0.05] bg-neutral-950/85 backdrop-blur-md rounded-[1.75rem] overflow-hidden transition-all duration-300 ${active ? "border-[#10b981]/40 bg-neutral-950/95" : "hover:border-white/10"
                        }`}
                    >
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full px-8 py-5.5 flex items-center justify-between text-left font-bold text-white transition-colors"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <ChevronDown className={`w-4.5 h-4.5 text-white/30 transition-transform duration-300 shrink-0 ${active ? "rotate-180 text-white" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="px-8 pb-7 text-white/50 leading-relaxed border-t border-white/[0.03] pt-5 font-light font-sans text-[13.5px]"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                {FAQS.filter((_, idx) => idx % 2 !== 0).map((faq, index) => {
                  const idx = index * 2 + 1;
                  const active = activeFaq === idx;

                  return (
                    <div
                      key={idx}
                      className={`border border-white/[0.05] bg-neutral-950/85 backdrop-blur-md rounded-[1.75rem] overflow-hidden transition-all duration-300 ${active ? "border-[#10b981]/40 bg-neutral-950/95" : "hover:border-white/10"
                        }`}
                    >
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full px-8 py-5.5 flex items-center justify-between text-left font-bold text-white transition-colors"
                      >
                        <span className="pr-4">{faq.q}</span>
                        <ChevronDown className={`w-4.5 h-4.5 text-white/30 transition-transform duration-300 shrink-0 ${active ? "rotate-180 text-white" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="px-8 pb-7 text-white/50 leading-relaxed border-t border-white/[0.03] pt-5 font-light font-sans text-[13.5px]"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Manifesto Letter Section ── */}
        <section id="manifesto" className="py-16 border-t border-white/[0.04] bg-neutral-950/30 relative overflow-hidden">
          <div className="relative z-10 max-w-[760px] mx-auto px-6 text-center">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-white/30 block mb-6">
              Manifesto
            </span>

            <h2 className="text-[28px] sm:text-[38px] font-serif italic text-white mb-10 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
              To the Developer Core,
            </h2>

            <div className="space-y-8 text-[14.5px] sm:text-[17px] text-white/55 leading-relaxed text-justify font-light font-sans">
              <p>
                Every session is <span className="text-[#10b981] font-semibold text-shadow-sm">verified with precision.</span>
              </p>
              <p>
                Each identity proof is atomic, each verification designed as if it were singular. We seek
                no comfort in shared secrets, only in the liveness of credentials. One active liveness verification
                outweighs a thousand static credentials.
              </p>
              <p>
                Inside NFL, security is absolute, compliance is constant, and trust is not fleeting but generational.
              </p>
              <p>
                This is not simply a security gate. It is a network of NeoFace Nodes, chosen and bound together to shape enduring trust.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Trust Section & Customer Stories ── */}
      <div ref={testimonialsRef} className="relative">
        <ScrollSequence
          folderPath="/Sequence/video6"
          frameCount={201}
          sectionRef={testimonialsRef}
          opacity={0.22}
          overlayOpacity={0.4}
        />
        <Testimonials />
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
