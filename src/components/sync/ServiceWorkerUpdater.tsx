"use client";

import { useEffect, useState, useCallback } from "react";

const DISMISS_KEY = "sw-update-dismissed";

export default function ServiceWorkerUpdater() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    navigator.serviceWorker.ready.then((registration) => {
      const sw = registration.waiting;
      if (sw) setWaiting(sw);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaiting(newWorker);
          }
        });
      });
    });

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, [dismissed]);

  const update = useCallback(() => {
    if (!waiting) return;

    setIsUpdating(true);
    waiting.postMessage({ type: "SKIP_WAITING" });

    // Fallback: force reload after 2 seconds if controllerchange doesn't fire
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, [waiting]);

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "true");
    }
    setDismissed(true);
    setWaiting(null);
  }, []);

  if (!waiting || dismissed) return null;

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
        zIndex: 9999,
      }}
    >
      <span>{isUpdating ? "Atualizando..." : "Nova versão disponível."}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {!isUpdating && (
          <>
            <button
              onClick={dismiss}
              style={{
                background: "transparent",
                color: "#9CA3AF",
                border: "1px solid #4B5563",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Depois
            </button>
            <button
              onClick={update}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Atualizar
            </button>
          </>
        )}
        {isUpdating && (
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
