import { useEffect, useState } from "react";
import { hasSyncedRecords } from "@/lib/sqlite-db";
import { isSupabaseConfigured } from "@/lib/supabase-client";

export type SyncNotificationType = "success" | "error" | null;

export interface SyncNotification {
  type: SyncNotificationType;
  message: string;
  timestamp: number;
}

const SYNC_SUCCESS_KEY = "sync_success_shown";

// Hook para gerenciar notificações de sincronização
export function useSyncNotifications() {
  const [notification, setNotification] = useState<SyncNotification | null>(null);

  useEffect(() => {
    // Verifica se deve mostrar notificação ao carregar (se já está sincronizado)
    const checkInitialSync = async () => {
      if (!isSupabaseConfigured()) {
        return;
      }

      const hasShownSuccess = localStorage.getItem(SYNC_SUCCESS_KEY) === "true";
      
      // Se já mostrou antes, não precisa verificar
      if (hasShownSuccess) {
        return;
      }

      // Verifica se há registros sincronizados
      try {
        const hasSynced = await hasSyncedRecords();
        if (hasSynced) {
          setNotification({
            type: "success",
            message: "Banco de dados sincronizado com Supabase com sucesso!",
            timestamp: Date.now(),
          });
          localStorage.setItem(SYNC_SUCCESS_KEY, "true");
        }
      } catch (error) {
        console.error("Erro ao verificar sincronização:", error);
      }
    };

    // Verifica ao montar o componente
    checkInitialSync();

    // Listener para eventos de sincronização
    const handleSyncEvent = (event: CustomEvent) => {
      const { type, message } = event.detail;

      if (type === "success") {
        // Verifica se já mostrou sucesso antes (verifica a cada evento)
        const hasShownSuccess = localStorage.getItem(SYNC_SUCCESS_KEY) === "true";
        
        // Só mostra sucesso na primeira vez
        if (!hasShownSuccess) {
          setNotification({
            type: "success",
            message: message || "Banco de dados sincronizado com Supabase com sucesso!",
            timestamp: Date.now(),
          });
          localStorage.setItem(SYNC_SUCCESS_KEY, "true");
        }
      } else if (type === "error") {
        // Sempre mostra erros
        setNotification({
          type: "error",
          message: message || "Erro ao sincronizar com Supabase",
          timestamp: Date.now(),
        });
      }
    };

    // Adiciona listener
    window.addEventListener("sync-event", handleSyncEvent as EventListener);

    return () => {
      window.removeEventListener("sync-event", handleSyncEvent as EventListener);
    };
  }, []);

  const dismissNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    dismissNotification,
  };
}

// Função para emitir eventos de sincronização
export function emitSyncEvent(type: "success" | "error", message?: string) {
  if (typeof window === "undefined") return;

  const event = new CustomEvent("sync-event", {
    detail: { type, message },
  });
  window.dispatchEvent(event);
}

