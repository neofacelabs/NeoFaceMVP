"use client";
import React from "react";
import Link from "next/link";
import { TextHoverEffect } from "./ui/text-hover-effect";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 w-full overflow-hidden pt-16 pb-8 bg-transparent">
      {/* Scope strict left-alignment for footer navigation columns to override global/webflow CSS defaults */}
      <style dangerouslySetInnerHTML={{ __html: `
        .nfl-footer-column,
        .nfl-footer-column ul, 
        .nfl-footer-column li, 
        .nfl-footer-column a,
        .nfl-footer-column span {
          text-align: left !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
      `}} />

      {/* Background Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"></div>
        <div className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-16 z-10">
        
        {/* Border Top Divider */}
        <div className="w-full h-px bg-white/5 mb-16" />

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-start text-left mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="mb-2 flex items-center">
              <img
                src="/newlogo.png"
                alt="NeoFace Labs"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-white/45 text-[13px] leading-relaxed font-sans font-light max-w-[240px]">
              Building the Identity Layer for the Next Internet. Secure, multi-modal biometric hashing inside hardware enclaves.
            </p>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 text-[10.5px] text-white/35 font-mono mt-2 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Auth API: Operational
            </div>

            {/* Social Links */}
            <div className="flex gap-4 text-white/40 mt-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[#00E5A8] transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5v-14a5 5 0 00-5-5zm-11 19h-3v-9h3zm-1.5-10.268a1.752 1.752 0 110-3.505 1.752 1.752 0 010 3.505zm15.5 10.268h-3v-4.5c0-1.07-.02-2.450-1.492-2.450-1.495 0-1.725 1.166-1.725 2.372v4.578h-3v-9h2.88v1.23h.04a3.157 3.157 0 012.847-1.568c3.042 0 3.605 2.003 3.605 4.612v4.726z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#00E5A8] transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Product</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Authentication Methods</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">NeoID</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Trust Engine</Link></li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Developers</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/features" className="hover:text-white transition-colors">Quick Start</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">API Documentation</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Webhooks</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Rate Limits</Link></li>
              <li className="flex items-center gap-1.5">
                <span className="hover:text-white transition-colors">SDKs</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/35 uppercase">Soon</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Company</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/#manifesto" className="hover:text-white transition-colors">Manifesto</Link></li>
              <li><a href="mailto:contact@neoface.io" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 5: Resources */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Resources</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/features" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/pricing#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Tutorials</Link></li>
            </ul>
          </div>

          {/* Column 6: Security */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Security</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/about" className="hover:text-white transition-colors">Security Overview</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Infrastructure</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Encryption</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Responsible Disclosure</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Compliance</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Trust Center</Link></li>
            </ul>
          </div>

          {/* Column 7: Legal */}
          <div className="flex flex-col gap-3 items-start text-left nfl-footer-column">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5A8] uppercase">Legal</span>
            <ul className="flex flex-col gap-2 text-[12.5px] font-sans font-light text-white/45">
              <li><Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Security & Compliance</Link></li>
            </ul>
          </div>

        </div>

        {/* Large NEOFACE LABS watermark wordmark with interactive hover reveal effect */}
        <div className="w-full h-[120px] md:h-[180px] overflow-hidden relative z-20 mt-16 select-none">
          <TextHoverEffect text="NEOFACE LABS" />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] font-mono text-white/25">
          <span>&copy; 2026 NeoFace Labs. All rights reserved.</span>
          <span className="text-[10px] text-white/15">Building the Identity Layer for the Next Internet.</span>
        </div>

      </div>
    </footer>
  );
}
