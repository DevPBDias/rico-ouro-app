import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
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
  };
}
