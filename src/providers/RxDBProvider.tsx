"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MyDatabase } from "@/db/collections";
import { getDatabase } from "@/db/client";

interface RxDBContextType {
  db: MyDatabase | null;
  isLoading: boolean;
  error: Error | null;
}

const RxDBContext = createContext<RxDBContextType>({
  db: null,
  isLoading: true,
  error: null,
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

  useEffect(() => {
    let mounted = true;

    getDatabase()
      .then((database) => {
        if (mounted) {
          setDb(database);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RxDBContext.Provider value={{ db, isLoading, error }}>
      {children}
    </RxDBContext.Provider>
  );
}
