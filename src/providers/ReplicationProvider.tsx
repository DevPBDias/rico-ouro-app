"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRxDB } from "./RxDBProvider";
import { useIntelligentPollingSync } from "@/hooks/sync/useIntelligentPollingSync";
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

  // Ativa o sistema de polling inteligente para sincronização
  useEffect(() => {
    console.log(
      "🔍 [ReplicationProvider] useIntelligentPollingSync will be called",
      {
        hasDb: !!db,
        isLoading,
        hasReplications: !!(db as any)?.replications,
      }
    );
  }, [db, isLoading]);

  useIntelligentPollingSync(db);

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
    if (!isLoading && db && (db as any).replications) {
      const replicationsMap = (db as any).replications;
      const replicationEntries = Object.entries(replicationsMap);

      console.log(
        `📡 [ReplicationProvider] Tracking ${replicationEntries.length} entities:`,
        Object.keys(replicationsMap)
      );

      if (replicationEntries.length === 0) return;

      // Inicializa o estado com as entidades conhecidas
      setEntityStatus((prev) => {
        const next = { ...prev };
        replicationEntries.forEach(([name]) => {
          if (!next[name]) next[name] = { isSyncing: false, error: null };
        });
        return next;
      });

      const subscriptions: any[] = [];

      replicationEntries.forEach(([name, rep]: [string, any]) => {
        if (!rep) return;

        // Track activity (active$)
        subscriptions.push(
          rep.active$.subscribe((isActive: boolean) => {
            setEntityStatus((prev) => ({
              ...prev,
              [name]: { ...prev[name], isSyncing: isActive },
            }));
          })
        );

        // Track errors (error$)
        subscriptions.push(
          rep.error$.subscribe((error: Error | null) => {
            if (error) console.error(`❌ [Sync Error] ${name}:`, error);
            setEntityStatus((prev) => ({
              ...prev,
              [name]: { ...prev[name], error },
            }));
          })
        );
      });

      // Global sync status logic
      const activeObservables = replicationEntries.map(
        ([_, rep]: [string, any]) => rep.active$
      );
      const globalActiveSub = combineLatest(activeObservables).subscribe(
        (actives) => {
          const currentlySyncing = actives.some((a) => a === true);
          setIsSyncing(currentlySyncing);
          if (!currentlySyncing) setLastSyncedAt(new Date());
        }
      );

      const errorObservables = replicationEntries.map(
        ([_, rep]: [string, any]) => rep.error$
      );
      const globalErrorSub = combineLatest(errorObservables).subscribe(
        (errors) => {
          const activeErrors = errors.filter((err) => err !== null) as Error[];
          setReplicationErrors(activeErrors);
        }
      );

      subscriptions.push(globalActiveSub, globalErrorSub);

      return () => {
        subscriptions.forEach((sub) => sub.unsubscribe());
      };
    }
  }, [isLoading, db, (db as any)?.replications]); // Adicionado replications como dependência "fake"

  const triggerSync = useCallback(() => {
    if (!db || !(db as any).replications) return;
    Object.values((db as any).replications).forEach((rep: any) => {
      if (rep && typeof rep.reSync === "function") rep.reSync();
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
