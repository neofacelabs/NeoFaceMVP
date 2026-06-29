import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    const defaultBackend = isProd ? "https://neofacemvp.onrender.com" : "http://127.0.0.1:8000";
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || defaultBackend;
    
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
