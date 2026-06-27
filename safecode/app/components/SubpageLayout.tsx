"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Settings, Shield, User } from "lucide-react";
import { MenuBar } from "./ui/glow-menu";
import { motion } from "framer-motion";
import { Footer } from "./Footer";
import ColorBends from "./ui/ColorBends";
import { useAuthStore } from "@/store/auth";

interface SubpageLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    icon: HomeIcon,
    label: "Home",
    href: "/",
    gradient:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: Shield,
    label: "Features",
    href: "/features",
    gradient:
      "radial-gradient(circle, rgba(0,229,168,0.15) 0%, rgba(0,229,168,0.06) 50%, rgba(0,229,168,0) 100%)",
    iconColor: "text-emerald-400",
  },
  {
    icon: Settings,
    label: "Pricing",
    href: "/pricing",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: User,
    label: "About",
    href: "/about",
    gradient:
      "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
];

export default function SubpageLayout({ children }: SubpageLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  
  let activeNav = "Home";
  if (pathname.includes("/features")) activeNav = "Features";
  else if (pathname.includes("/pricing")) activeNav = "Pricing";
  else if (pathname.includes("/about")) activeNav = "About";
  return (
    <div className="w-full relative min-h-screen bg-transparent text-white overflow-x-hidden selection:bg-white selection:text-black">
      {/* ── ColorBends Animated WebGL Background ── */}
      <div className="fixed inset-0 z-[-20] pointer-events-none" style={{ opacity: 0.18 }}>
        <ColorBends
          colors={["#00E5A8", "#00C2FF", "#0a0a0a", "#003d2e"]}
          rotation={90}
          speed={0.12}
          scale={1.1}
          frequency={0.9}
          warpStrength={0.85}
          mouseInfluence={0.6}
          noise={0.08}
          parallax={0.3}
          iterations={1}
          intensity={1.2}
          bandWidth={5}
          transparent
          autoRotate={0.8}
        />
      </div>

      {/* ── Global Animated Gradient Mesh Background ── */}
      <div className="animated-gradient-mesh" />

      {/* ── Background Grid & Atmosphere ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.15) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 90%, transparent 100%)'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 55% at 72% 50%, rgba(0,229,168,0.04) 0%, transparent 65%),
            radial-gradient(ellipse 35% 40% at 18% 55%, rgba(0,194,255,0.02) 0%, transparent 65%)
          `,
        }}
      />

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
              onItemClick={() => {}} 
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


      {/* ── Main Content ── */}
      <main className="pt-32 pb-20 px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto relative z-10 min-h-[calc(100vh-320px)]">
        {children}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
