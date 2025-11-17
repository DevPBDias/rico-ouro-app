import { useEffect, useState } from "react";
import { db } from "@/lib/dexie";
import { isSupabaseConfigured, isOnline, onOnlineStatusChange } from "@/lib/supabase-client";

export type SyncStatus = "synced" | "error" | "offline" | "checking";

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>("checking");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    // Verifica status de sincronização
    const checkSyncStatus = async () => {
      // Se não está online, mostra amarelo
      if (!isOnline()) {
        setStatus("offline");
        return;
      }

      // Se Supabase não está configurado, mostra erro
      if (!isSupabaseConfigured()) {
        setStatus("error");
        return;
      }

      try {
        const [a, v, f, m] = await Promise.all([
          db.animals.where("uuid").notEqual("").count(),
          db.vaccines.where("uuid").notEqual("").count(),
          db.farms.where("uuid").notEqual("").count(),
          db.matrices.where("uuid").notEqual("").count(),
        ]);
        const hasSynced = a + v + f + m > 0;
        setStatus(hasSynced ? "synced" : "error");
      } catch (error) {
        console.error("Erro ao verificar status de sincronização:", error);
        setStatus("error");
      }
    };

    // Verifica status online inicial
    const checkOnlineStatus = () => {
      const isOn = isOnline();
      setOnline(isOn);
      
      // Se ficou offline, atualiza status imediatamente
      if (!isOn) {
        setStatus("offline");
      }
    };

    checkOnlineStatus();

    // Listener para mudanças de conectividade
    const unsubscribeOnline = onOnlineStatusChange((isOn) => {
      setOnline(isOn);
      
      if (!isOn) {
        setStatus("offline");
      } else {
        // Se voltou online, verifica status de sincronização
        checkSyncStatus();
      }
    });

    // Verifica imediatamente
    checkSyncStatus();

    // Verifica periodicamente (a cada 10 segundos)
    const syncInterval = setInterval(() => {
      if (isOnline()) {
        checkSyncStatus();
      }
    }, 10000);

    // Listener para eventos de sincronização
    const handleSyncEvent = (event: CustomEvent) => {
      const { type } = event.detail;

      // Só atualiza se estiver online
      if (!isOnline()) {
        setStatus("offline");
        return;
      }

      if (type === "success") {
        setStatus("synced");
      } else if (type === "error") {
        setStatus("error");
      }
    };

    window.addEventListener("sync-event", handleSyncEvent as EventListener);

    return () => {
      unsubscribeOnline();
      clearInterval(syncInterval);
      window.removeEventListener("sync-event", handleSyncEvent as EventListener);
    };
  }, []);

  return { status, online };
}

