"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getDatabase } from "@/db/rxdb";
import { MyDatabase } from "@/db/collections";

interface RxDBContextType {
  db: MyDatabase | null;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
}

const RxDBContext = createContext<RxDBContextType>({
  db: null,
  isLoading: true,
  isReady: false,
  error: null,
});

export const useRxDatabase = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error("useRxDatabase must be used within a RxDBProvider");
  }
  return context.db;
};

export const useRxDBContext = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error("useRxDBContext must be used within a RxDBProvider");
  }
  return context;
};

export function RxDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<MyDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initDB = async () => {
      try {
        const database = await getDatabase();
        if (mounted) {
          setDb(database);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize RxDB:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to initialize DB")
          );
          setIsLoading(false);
        }
      }
    };

    initDB();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RxDBContext.Provider
      value={{
        db,
        isLoading,
        isReady: !!db,
        error,
      }}
    >
      {children}
    </RxDBContext.Provider>
  );
}
