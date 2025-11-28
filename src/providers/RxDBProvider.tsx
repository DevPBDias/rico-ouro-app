"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

  // Proteção contra duplicação no React 19 Strict Mode
  const initializingRef = React.useRef(false);
  const initializedRef = React.useRef(false);

  useEffect(() => {
    // Só inicializar no cliente
    if (typeof window === "undefined") {
      return;
    }

    // Prevenir duplicação de inicialização
    if (initializingRef.current || initializedRef.current) {
      console.log("⚠️ RxDB já está sendo inicializado ou já foi inicializado");
      return;
    }

    initializingRef.current = true;
    let mounted = true;

    console.log("🚀 RxDBProvider: Iniciando getDB()...");

    // Usa o singleton getDB() que garante apenas UMA instância
    import("@/db/get-db")
      .then((mod) => mod.getDB())
      .then((database) => {
        if (mounted) {
          setDb(database);
          setIsLoading(false);
          initializedRef.current = true;
          console.log("✅ RxDBProvider: DB inicializado com sucesso");
        }
      })
      .catch((err) => {
        console.error("❌ RxDBProvider: Falha ao inicializar RxDB:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to initialize DB")
          );
          setIsLoading(false);
        }
      })
      .finally(() => {
        initializingRef.current = false;
      });

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
