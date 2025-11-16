import type { MetadataRoute } from "next";

// Default export manifest (as required by Next's webmanifest route).
// Exported as default directly to ensure the compiled module contains a default export
// and avoid runtime errors during the Vercel build step.
export default {
  name: "INDI Ouro",
  short_name: "INDI Ouro",
  start_url: "/",
  display: "standalone",
  background_color: "#1162ae",
  theme_color: "#1162ae",
  icons: [
    {
      src: "/logo.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "maskable",
    },
    {
      src: "/logo.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "maskable",
    },
  ],
} as MetadataRoute.Manifest;

/*
  Note: We also keep `public/manifest.json` for direct browser fetch; this file
  provides a typed default export so the App Router's `/manifest.webmanifest` route
  resolves a default export during build.
*/
