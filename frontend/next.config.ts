// next.config.mjs
/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  images: {
    // Usa remotePatterns porque necesitas puerto para WP local
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      // si usas Unsplash u otros, ponlos aquí:
      { protocol: 'https', hostname: 'images.unsplash.com' },

      // Tu WordPress local (según tu docker compose: http://localhost:8080)
      { protocol: 'http', hostname: 'localhost', port: '8080' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080' },
            { protocol: "http", hostname: "localhost", port: "8080", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "futureoffounders.com", pathname: "/wp-content/**" }
    ],
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
