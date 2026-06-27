import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import "./webflow.css";
import "./main.css";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeoFace Labs — Enterprise Biometric Identity & Trust Layer",
  description: "The identity layer of the next internet. Production-ready multi-modal biometrics with advanced deepfake and liveness detection.",
  keywords: ["biometrics", "authentication", "face id", "iris scan", "fingerprint verification", "deepfake detection", "liveness check", "trust score", "identity engine"],
  authors: [{ name: "NeoFace Labs Team" }],
  openGraph: {
    title: "NeoFace Labs — Enterprise Biometric Identity & Trust Layer",
    description: "Multi-modal biometric authentication for the post-password era. Secure authentication APIs & SDKs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`lenis dark ${plusJakarta.variable}`}>
      <head />
      <body className="font-sans antialiased bg-black text-white min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
