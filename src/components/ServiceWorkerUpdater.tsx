"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerUpdater() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      const sw = registration.waiting;
      if (sw) setWaiting(sw);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(newWorker);
          }
        });
      });
    });

    const onControllerChange = () => {
      // reload quando o novo SW assume o controle
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const update = () => {
    if (!waiting) return;
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  if (!waiting) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        background: "#111827",
        color: "white",
        padding: "12px 16px",
        borderRadius: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        zIndex: 50,
      }}
    >
      <span>Nova versão disponível.</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setWaiting(null)}>Depois</button>
        <button onClick={update} style={{ background: "#2563eb", color: "#fff" }}>
          Atualizar
        </button>
      </div>
    </div>
  );
}


