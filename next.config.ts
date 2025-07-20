import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
  },
  allowedDevOrigins: ["https://*.replit.dev"],
};

export default nextConfig;
