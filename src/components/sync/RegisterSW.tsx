"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Check for existing registration
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const hasSw = regs.some((r) => (r.scope || "").includes(location.origin));
      if (hasSw) return;

      // Try to register the generated service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker registrado em /sw.js");
        })
        .catch((err) => {
          console.warn("Falha ao registrar Service Worker:", err);
        });
    });
  }, []);

  return null;
}
