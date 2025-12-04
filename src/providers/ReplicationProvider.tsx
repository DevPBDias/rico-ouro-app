"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRxDB } from "./RxDBProvider";
import { RxReplicationState } from "rxdb/plugins/replication";
import { combineLatest } from "rxjs";

interface ReplicationContextType {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  online: boolean;
  replicationErrors: Error[];
}

const ReplicationContext = createContext<ReplicationContextType>({
  isSyncing: false,
  lastSyncedAt: null,
  online: true,
  replicationErrors: [],
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
      const replications = Object.values(db.replications) as RxReplicationState<
        any,
        any
      >[];
      if (replications.length === 0) return;

      const activeSubscription = combineLatest(
        replications.map((rep) => rep.active$)
      ).subscribe((actives) => {
        setIsSyncing(actives.some((isActive) => isActive));
        if (actives.every((isActive) => !isActive)) {
          setLastSyncedAt(new Date());
        }
      });

      const errorSubscription = combineLatest(
        replications.map((rep) => rep.error$)
      ).subscribe((errors) => {
        const activeErrors = errors.filter((err) => err !== null) as Error[];
        setReplicationErrors(activeErrors);
      });

      return () => {
        activeSubscription.unsubscribe();
        errorSubscription.unsubscribe();
      };
    }
  }, [isLoading, db]);

  useEffect(() => {
    if (online && !isLoading && db && db.replications) {
      Object.values(db.replications).forEach((rep) => {
      });
    }
  }, [online, isLoading, db]);

  return (
    <ReplicationContext.Provider
      value={{
        isSyncing,
        lastSyncedAt,
        online,
        replicationErrors,
      }}
    >
      {children}
    </ReplicationContext.Provider>
  );
}
