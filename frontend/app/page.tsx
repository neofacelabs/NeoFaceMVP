import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { ModalitiesSection } from "@/components/landing/ModalitiesSection";
import { ProductSection } from "@/components/landing/ProductSection";
import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "NeoFace Cloud — The Identity Layer for the Next Internet",
  description:
    "AI-powered identity infrastructure APIs for developers. Face authentication, liveness detection, fingerprint/WebAuthn, risk engine, and device trust. Build secure authentication in minutes.",
  openGraph: {
    title: "NeoFace Cloud — The Identity Layer for the Next Internet",
    description:
      "AI-powered identity infrastructure APIs. Face authentication, liveness detection, fingerprint/WebAuthn, and risk engine. Enterprise-grade security, developer-first APIs.",
    type: "website",
  },
  keywords: [
    "face authentication API",
    "biometric authentication",
    "liveness detection",
    "WebAuthn passkeys",
    "identity infrastructure",
    "authentication as a service",
    "AaaS",
    "face recognition API",
    "risk engine",
    "device trust",
  ],
};

export default function HomePage() {
  return (
    <main className="relative bg-black min-h-screen">
      <Navbar />
      <HeroSection />
      <ScrollStory />
      <ModalitiesSection />
      <ProductSection />
      <DeveloperSection />
      <SecuritySection />
      <ArchitectureSection />
      <PricingSection />
      <FaqSection />
      <BlogSection />
      <ContactSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
