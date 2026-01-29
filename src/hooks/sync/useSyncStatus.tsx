"use client";

export { useReplication } from "@/providers/ReplicationProvider";
import { useReplication } from "@/providers/ReplicationProvider";
import { useEffect, useState } from "react";

export type SyncStatus =
  | "synced"
  | "syncing"
  | "offline"
  | "error"
  | "pending"
  | "checking";

export function useSyncStatus() {
  const {
    isSyncing,
    online,
    replicationErrors,
    triggerSync,
    lastSyncedAt,
    entityStatus,
  } = useReplication();
  const [status, setStatus] = useState<SyncStatus>("checking");

  useEffect(() => {
    if (!online) {
      setStatus("offline");
    } else if (isSyncing) {
      setStatus("syncing");
    } else if (replicationErrors.length > 0) {
      setStatus("error");
    } else {
      setStatus("synced");
    }
  }, [isSyncing, online, replicationErrors]);

  return {
    status,
    online,
    pendingCount: 0, // RxDB não expõe contagem de pendentes facilmente por default
    isSyncing,
    isOffline: !online,
    hasPending: false,
    hasError: replicationErrors.length > 0,
    triggerSync,
    lastSyncedAt,
    errors: replicationErrors,
    entityStatus,
  };
}
