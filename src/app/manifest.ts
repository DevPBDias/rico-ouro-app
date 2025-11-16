import type { MetadataRoute } from "next";

// App manifest exported for type-safety and documentation.
// The app still serves `public/manifest.json` for compatibility with the browser.
export const manifest: MetadataRoute.Manifest = {
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
      purpose: "any maskable",
    },
    {
      src: "/logo.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ],
};

export default manifest;

/*
  Note: We maintain `public/manifest.json` for the browser to fetch directly at /manifest.json.
  This `manifest` export provides TypeScript-level manifest shape and documents icons used.
*/
