// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "futureoffounders.com", pathname: "/wp-content/**" }
    ]
  },

  webpack: (config) => {
    // Alias "@/..." -> "src/..."
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src")
    };
    return config;
  }
};

export default nextConfig;
