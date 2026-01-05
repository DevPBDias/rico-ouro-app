"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRxDB } from "./RxDBProvider";
import { RxReplicationState } from "rxdb/plugins/replication";
import { combineLatest } from "rxjs";

interface ReplicationContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  online: boolean;
  replicationErrors: Error[];
  triggerSync: () => void;
  entityStatus: Record<string, { isSyncing: boolean; error: Error | null }>;
}

const ReplicationContext = createContext<ReplicationContextType>({
  isSyncing: false,
  lastSyncedAt: null,
  online: true,
  replicationErrors: [],
  triggerSync: () => {},
  entityStatus: {},
});

export const useReplication = () => useContext(ReplicationContext);

export function ReplicationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { db, isLoading } = useRxDB();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);
  const [replicationErrors, setReplicationErrors] = useState<Error[]>([]);
  const [entityStatus, setEntityStatus] = useState<
    Record<string, { isSyncing: boolean; error: Error | null }>
  >({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && db && db.replications) {
      const replicationEntries = Object.entries(db.replications);
      if (replicationEntries.length === 0) return;

      const subscriptions: any[] = [];

      replicationEntries.forEach(([name, rep]: [string, any]) => {
        // Track activity
        subscriptions.push(
          rep.active$.subscribe((isActive: boolean) => {
            setEntityStatus((prev) => ({
              ...prev,
              [name]: { ...prev[name], isSyncing: isActive },
            }));
          })
        );

        // Track errors
        subscriptions.push(
          rep.error$.subscribe((error: Error | null) => {
            setEntityStatus((prev) => ({
              ...prev,
              [name]: { ...prev[name], error },
            }));
          })
        );
      });

      // Global sync status
      const globalActiveSub = combineLatest(
        replicationEntries.map(([_, rep]: [string, any]) => rep.active$)
      ).subscribe((actives) => {
        setIsSyncing(actives.some((isActive) => isActive));
        if (actives.every((isActive) => !isActive)) {
          setLastSyncedAt(new Date());
        }
      });

      // Global error status
      const globalErrorSub = combineLatest(
        replicationEntries.map(([_, rep]: [string, any]) => rep.error$)
      ).subscribe((errors) => {
        const activeErrors = errors.filter((err) => err !== null) as Error[];
        setReplicationErrors(activeErrors);
      });

      subscriptions.push(globalActiveSub, globalErrorSub);

      return () => {
        subscriptions.forEach((sub) => sub.unsubscribe());
      };
    }
  }, [isLoading, db]);

  const triggerSync = useCallback(() => {
    if (!db || !db.replications) return;
    console.log(
      "[RxDB] Manually triggering synchronization for all collections..."
    );
    Object.values(db.replications).forEach((rep) => {
      if (rep && typeof rep.reSync === "function") {
        rep.reSync();
      }
    });
  }, [db]);

  return (
    <ReplicationContext.Provider
      value={{
        isSyncing,
        lastSyncedAt,
        online,
        replicationErrors,
        triggerSync,
        entityStatus,
      }}
    >
      {children}
    </ReplicationContext.Provider>
  );
}
