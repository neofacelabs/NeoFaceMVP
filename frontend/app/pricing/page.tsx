import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingPage } from "@/components/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing — NeoFace Auth | Biometric Authentication API",
  description:
    "Simple, transparent pricing for NeoFace Auth. Start free with the Starter plan (Free, 1,000 verifications/month). Scale with Pro ($149/mo) or Enterprise plans.",
};

export default function PricingRoute() {
  return (
    <div className="bg-black min-h-screen pt-16">
      <Navbar />
      <PricingPage />
      <Footer />
    </div>
  );
}
