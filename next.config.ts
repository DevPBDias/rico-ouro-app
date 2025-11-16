import type { NextConfig } from "next";
// @ts-expect-error: Tipos de 'next-pwa' podem não estar instalados
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    // Fallback page quando offline
    document: "/offline.html",
  },
  runtimeCaching: [
    {
      // Assets estáticos gerados pelo Next
      urlPattern: /^\/(_next\/static|static)\//,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Imagens otimizadas pelo Next
      urlPattern: /^\/_next\/image/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-image",
        expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Imagens externas e ícones
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // Página inicial e páginas críticas (NetworkFirst para ter dados novos quando online)
      urlPattern: /^\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
});

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
};

export default withPWA(nextConfig);
