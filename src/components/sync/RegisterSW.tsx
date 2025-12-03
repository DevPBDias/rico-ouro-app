"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV === "true";
    if (process.env.NODE_ENV !== "production" && !enableInDev) return; // Only register in production by default
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        if (reg.active?.scriptURL.includes("sw-offline.js")) {
          reg.unregister();
        }
      }

      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
        })
        .catch((err) => {
        });
    });
  }, []);

  return null;
}
