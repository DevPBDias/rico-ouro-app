"use client";

import React, { useEffect, useState } from "react";
import { useRxDB } from "@/providers";
import { useOfflineStatus } from "@/hooks/sync/useOfflineStatus";
import { Loader2, WifiOff, AlertCircle, RefreshCw } from "lucide-react";

interface DynamicPageWrapperProps<T> {
  id: string | undefined;
  fetchData: (id: string) => Promise<T | null | undefined>;
  children: (data: T) => React.ReactNode;
  entityName?: string;
  loadingComponent?: React.ReactNode;
  notFoundComponent?: React.ReactNode;
  deps?: React.DependencyList;
}

type LoadingState = "loading" | "ready" | "error" | "not-found" | "offline";

export function DynamicPageWrapper<T>({
  id,
  fetchData,
  children,
  entityName = "Item",
  loadingComponent,
  notFoundComponent,
  deps = [],
}: DynamicPageWrapperProps<T>) {
  const { db, isReady: isDbReady, isLoading: isDbLoading } = useRxDB();
  const { isOnline } = useOfflineStatus();

  const [data, setData] = useState<T | null>(null);
  const [state, setState] = useState<LoadingState>("loading");
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    if (!id) {
      setState("not-found");
      return;
    }

    if (!db || !isDbReady) {
      return;
    }

    setState("loading");
    setError(null);

    try {
      const result = await fetchData(id);

      if (!result) {
        setState("not-found");
        setData(null);
      } else {
        setData(result);
        setState("ready");
      }
    } catch (err) {
      console.error(`[DynamicPage] Error loading ${entityName}:`, err);
      setError(err as Error);
      setState("error");
    }
  };

  useEffect(() => {
    if (isDbReady && id) {
      loadData();
    }
  }, [db, isDbReady, id, ...deps]);

  // Retry handler
  const handleRetry = () => {
    loadData();
  };

  if (isDbLoading || (!isDbReady && state === "loading")) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-6">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados...</p>
          {!isOnline && (
            <p className="text-sm text-amber-500 mt-2 flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              Modo Offline
            </p>
          )}
        </div>
      </div>
    );
  }

  if (state === "loading") {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-6">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando {entityName}...</p>
        </div>
      </div>
    );
  }

  if (state === "not-found") {
    if (notFoundComponent) {
      return <>{notFoundComponent}</>;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {entityName} não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            {isOnline
              ? `O ${entityName.toLowerCase()} solicitado não existe ou foi removido.`
              : `Este ${entityName.toLowerCase()} não está disponível offline. Visite a página online primeiro.`}
          </p>
          {!isOnline && (
            <div className="flex items-center justify-center gap-2 text-amber-500 mb-4">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">Você está offline</span>
            </div>
          )}
          <a
            href="javascript:history.back()"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Voltar
          </a>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground mb-4">
            Ocorreu um erro ao carregar {entityName.toLowerCase()}.
          </p>
          {error && (
            <p className="text-sm text-red-500 mb-4 font-mono">
              {error.message}
            </p>
          )}
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (state === "ready" && data) {
    return <>{children(data)}</>;
  }

  return null;
}

export function useDynamicData<T>(
  id: string | undefined,
  fetchData: (id: string) => Promise<T | null | undefined>
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { db, isReady: isDbReady } = useRxDB();

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (!id || !db || !isDbReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData(id);
      setData(result ?? null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDbReady && id) {
      refetch();
    }
  }, [db, isDbReady, id]);

  return { data, isLoading, error, refetch };
}
