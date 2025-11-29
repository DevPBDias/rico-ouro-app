"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";
    if (process.env.NODE_ENV !== "production" && !enableInDev) return; // Only register in production by default
    if (!("serviceWorker" in navigator)) return;

    // Check for legacy service workers and unregister them
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        // If the user has the old sw-offline.js, unregister it
        if (reg.active?.scriptURL.includes("sw-offline.js")) {
          console.log("🗑️ Removendo Service Worker legado (sw-offline.js)...");
          reg.unregister();
        }
      }

      // Always register the correct service worker
      // The browser handles deduplication if the URL is the same
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          console.log("✅ Service Worker registrado em /sw.js", reg);
        })
        .catch((err) => {
          console.warn("❌ Falha ao registrar Service Worker:", err);
        });
    });
  }, []);

  return null;
}
