import type { NextConfig } from "next";

// Removed `next-pwa` to use Next.js recommended PWA approach (custom sw + manifest).
// This avoids aggressive precaching of dynamic `_next` manifests which can cause
// `bad-precaching-response` errors when those files are not present in some builds.

const nextConfig: NextConfig = {
  /* outras opções de config podem ser adicionadas aqui */
  webpack: (config, { isServer }) => {
    // Configuração para sql.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  // Add headers to ensure service worker is served with correct headers and not cached
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
