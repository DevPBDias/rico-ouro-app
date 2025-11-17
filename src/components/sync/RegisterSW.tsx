"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";
    if (process.env.NODE_ENV !== "production" && !enableInDev) return; // Only register in production by default
    if (!("serviceWorker" in navigator)) return;

    // Check for existing registration to avoid duplicates
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const hasSw = regs.some((r) => (r.scope || "").includes(location.origin));
      if (hasSw) return;

      // Register the custom service worker with conservative options.
      // updateViaCache: 'none' helps the worker see immediate updates in dev/CI.
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          console.log("Service Worker registrado em /sw.js", reg);
        })
        .catch((err) => {
          console.warn("Falha ao registrar Service Worker:", err);
        });
    });
  }, []);

  return null;
}
