"use client";

import { useState, useEffect } from "react";
import { isOnline, onOnlineStatusChange } from "@/lib/supabase/api";

export type SyncStatus =
  | "synced"
  | "syncing"
  | "offline"
  | "error"
  | "checking";

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>("checking");
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialOnlineStatus = isOnline();
    setOnline(initialOnlineStatus);
    setStatus(initialOnlineStatus ? "synced" : "offline");

    const unsubscribe = onOnlineStatusChange((isOnlineNow) => {
      setOnline(isOnlineNow);

      if (isOnlineNow) {
        setStatus("syncing");

        setTimeout(() => {
          setStatus("synced");
        }, 2000);
      } else {
        setStatus("offline");
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    status,
    online,
    isSyncing: status === "syncing",
    isOffline: status === "offline",
    hasError: status === "error",
  };
}
