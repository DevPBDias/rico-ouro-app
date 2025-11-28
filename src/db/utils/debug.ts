"use client";

export function startRxDBDebugLogs(dbName: string) {
  if (typeof window === "undefined") return;

  console.groupCollapsed(`🧪 RxDB Debugging: ${dbName}`);

  console.log("User Agent:", navigator.userAgent);
  console.log("Online:", navigator.onLine);
  console.log("Platform:", navigator.platform);
  console.log("IndexedDB Supported:", "indexedDB" in window);

  // --- IndexedDB global error handler ---
  window.addEventListener("error", (event) => {
    console.error("❌ Global JS Error:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("❌ Unhandled Promise:", event.reason);
  });

  // --- IndexedDB fail detection ---
  const idb = indexedDB;

  if (idb && idb.databases) {
    idb
      .databases()
      .then((dbs) => {
        console.log("📦 IndexedDB Databases:", dbs);
      })
      .catch((err) => {
        console.error("❌ Failed to list databases:", err);
      });
  } else {
    console.warn("⚠️ Browser does not support indexedDB.databases()");
  }

  // --- Try to open the raw IndexedDB directly ---
  const request = idb.open(dbName);
  request.onerror = (ev) => {
    const err = (ev.target as any)?.error;
    console.error("❌ Raw IndexedDB open ERROR:", err?.message || err);
  };
  request.onblocked = () => {
    console.warn("⛔ IndexedDB blocked by another tab");
  };
  request.onupgradeneeded = (e: any) => {
    console.log("🔧 Raw IndexedDB upgrade triggered. Version:", e.newVersion);
  };
  request.onsuccess = () => {
    console.log("✅ Raw IndexedDB open success");
  };

  // --- Log IndexedDB storage usage ---
  if ("storage" in navigator && navigator.storage?.estimate) {
    navigator.storage.estimate().then((usage) => {
      console.log("💾 Storage Estimate:", usage);
    });
  }

  // --- Custom log for RxDB errors ---
  console.error = ((origError) =>
    function (...args) {
      if (
        args[0]?.message?.includes?.("RxError") ||
        args[0]?.toString?.().includes("RxError")
      ) {
        console.groupCollapsed("🔥 RXDB ERROR DETECTED");
        console.log("Message:", args[0]);
        console.trace("Stack Trace:");
        console.groupEnd();
      }
      origError(...args);
    })(console.error);

  console.groupEnd();
}
