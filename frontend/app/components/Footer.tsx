"use client";
import React from "react";
import Link from "next/link";
import { TextHoverEffect } from "./ui/text-hover-effect";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 w-full overflow-hidden pt-16 pb-8 bg-transparent">
      <style jsx>{`
        .glass-footer {
          backdrop-filter: blur(12px) saturate(180%);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 229, 168, 0.01) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.8),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"></div>
      </div>

      <div className="glass-footer relative mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-10 rounded-[32px] px-8 md:px-10 py-12 z-10 items-start text-left">
        {/* Left Column: Logo & Description */}
        <div className="md:col-span-4 flex flex-col items-start max-w-sm">
          <Link href="/" className="mb-4 flex items-center">
            <img
              src="/newlogo.png"
              alt="NeoFace Labs"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-white/45 mb-6 text-[13px] leading-relaxed font-sans font-light">
            Secure, passwordless authentication infrastructure using homomorphic biometric hashing inside hardware secure enclaves.
          </p>
          <div className="flex gap-4.5 text-emerald-400">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.387-4.099 11.605-11.604 11.605A11.561 11.561 0 010 18.29c.373.044.734.074 1.12.074a8.189 8.189 0 005.065-1.737 4.102 4.102 0 01-3.834-2.85c.25.04.5.065.765.065.37 0 .734-.049 1.08-.147A4.092 4.092 0 01.8 8.582v-.05a4.119 4.119 0 001.853.522A4.099 4.099 0 01.812 5.847c0-.02 0-.042.002-.062a11.653 11.653 0 008.457 4.287A4.62 4.62 0 0122 5.924a8.215 8.215 0 002.018-.559 4.108 4.108 0 01-1.803 2.268 8.233 8.233 0 002.368-.648 8.897 8.897 0 01-2.062 2.112z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .29a12 12 0 00-3.797 23.401c.6.11.82-.26.82-.577v-2.17c-3.338.726-4.042-1.415-4.042-1.415-.546-1.387-1.332-1.756-1.332-1.756-1.09-.744.084-.729.084-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.306 3.495.999.106-.775.418-1.307.76-1.608-2.665-.301-5.466-1.332-5.466-5.933 0-1.31.469-2.381 1.236-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.301 1.23a11.502 11.502 0 016.002 0c2.292-1.552 3.297-1.23 3.297-1.23.654 1.653.242 2.873.119 3.176.77.841 1.235 1.912 1.235 3.222 0 4.61-2.805 5.629-5.476 5.925.429.369.813 1.096.813 2.211v3.285c0 .32.217.694.825.576A12 12 0 0012 .29"></path>
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5v-14a5 5 0 00-5-5zm-11 19h-3v-9h3zm-1.5-10.268a1.752 1.752 0 110-3.505 1.752 1.752 0 010 3.505zm15.5 10.268h-3v-4.5c0-1.07-.02-2.450-1.492-2.450-1.495 0-1.725 1.166-1.725 2.372v4.578h-3v-9h2.88v1.23h.04a3.157 3.157 0 012.847-1.568c3.042 0 3.605 2.003 3.605 4.612v4.726z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Nav Layout: Row-based Links for ultra-short vertical footprint */}
        <div className="md:col-span-8 flex flex-col gap-5 w-full text-left md:pl-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[13.5px] border-b border-white/[0.04] pb-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase min-w-[120px]">Product</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <Link href="/features" className="text-white/45 hover:text-white transition-colors">Features</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/pricing" className="text-white/45 hover:text-white transition-colors">Pricing</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">Developers</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/features" className="text-white/45 hover:text-white transition-colors">Integrations</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[13.5px] border-b border-white/[0.04] pb-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase min-w-[120px]">Company</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">About Us</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/#manifesto" className="text-white/45 hover:text-white transition-colors">Manifesto</Link>
              <span className="text-white/10 select-none">·</span>
              <a href="mailto:contact@neoface.io" className="text-white/45 hover:text-white transition-colors">Contact</a>
              <span className="text-white/10 select-none">·</span>
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">Careers</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[13.5px] border-b border-white/[0.04] pb-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase min-w-[120px]">Legal</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">Terms of Service</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">Trust Center</Link>
              <span className="text-white/10 select-none">·</span>
              <Link href="/about" className="text-white/45 hover:text-white transition-colors">DPA Addendum</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[13.5px]">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase min-w-[120px]">Compliance</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <span className="text-white/35 font-light">SOC 2 Type II</span>
              <span className="text-white/10 select-none">·</span>
              <span className="text-white/35 font-light">GDPR Compliant</span>
              <span className="text-white/10 select-none">·</span>
              <span className="text-white/35 font-light">HIPAA Ready</span>
              <span className="text-white/10 select-none">·</span>
              <span className="text-white/35 font-light">ISO 27001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Large NEOFACE LABS watermark wordmark with interactive hover reveal effect */}
      <div className="w-full h-[180px] md:h-[240px] mt-12 overflow-hidden relative z-20">
        <TextHoverEffect text="NEOFACE LABS" />
      </div>

      <div className="text-white/25 relative z-10 mt-6 text-center text-[11px] font-mono">
        <span>&copy; 2026 NeoFace Labs. All rights reserved.</span>
      </div>
    </footer>
  );
}
