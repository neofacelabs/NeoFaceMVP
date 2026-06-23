import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingPage } from "@/components/pricing/PricingPage";

export const metadata: Metadata = {
  title: "Pricing — NeoFace Auth | Biometric Authentication API",
  description:
    "Simple, transparent pricing for NeoFace Auth. Start free with 1,000 verifications/month. Scale with Starter ($49/mo), Pro ($149/mo), or Enterprise plans.",
};

export default function PricingRoute() {
  return (
    <>
      <Navbar />
      <PricingPage />
      <Footer />
    </>
  );
}
