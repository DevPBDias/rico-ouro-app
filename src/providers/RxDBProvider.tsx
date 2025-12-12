"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { MyDatabase } from "@/db/collections";
import { getDatabase, isDatabaseReady as checkDbReady } from "@/db/client";

interface RxDBContextType {
  db: MyDatabase | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
  retryConnection: () => void;
}

const RxDBContext = createContext<RxDBContextType>({
  db: null,
  isLoading: true,
  error: null,
  isReady: false,
  retryConnection: () => {},
});

export const useRxDB = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error("useRxDB must be used within RxDBProvider");
  }
  return context;
};

export const useRxDatabase = () => {
  const { db } = useRxDB();
  return db;
};

export const useRxDBContext = useRxDB;

export function RxDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<MyDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initDatabase = useCallback(async () => {
    if (typeof window === "undefined") return;

    setIsLoading(true);
    setError(null);

    try {
      const database = await getDatabase();
      setDb(database);
      setIsReady(true);
      setIsLoading(false);

      window.dispatchEvent(
        new CustomEvent("rxdb-ready", { detail: { database } })
      );

      console.log("[RxDB] Database ready for offline operations");
    } catch (err) {
      console.error("[RxDB] Failed to initialize database:", err);
      setError(err as Error);
      setIsLoading(false);
      setIsReady(false);
    }
  }, []);

  const retryConnection = useCallback(() => {
    console.log("[RxDB] Retrying database connection...");
    initDatabase();
  }, [initDatabase]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await initDatabase();
    };

    init();

    return () => {
      mounted = false;
    };
  }, [initDatabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      if (db && !error) {
        console.log("[RxDB] Back online, database ready for sync");
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [db, error]);

  return (
    <RxDBContext.Provider
      value={{ db, isLoading, error, isReady, retryConnection }}
    >
      {children}
    </RxDBContext.Provider>
  );
}

export function useWaitForDatabase() {
  const { db, isLoading, error, isReady } = useRxDB();

  return {
    db,
    isLoading,
    error,
    isReady,
    query: async <T,>(
      queryFn: (db: MyDatabase) => Promise<T>
    ): Promise<T | null> => {
      if (!db || !isReady) {
        console.warn("[RxDB] Database not ready for query");
        return null;
      }
      try {
        return await queryFn(db);
      } catch (err) {
        console.error("[RxDB] Query failed:", err);
        return null;
      }
    },
  };
}
