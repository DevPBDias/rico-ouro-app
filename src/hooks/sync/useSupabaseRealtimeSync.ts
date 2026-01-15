import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { MyDatabase } from "@/db/collections";
import { RealtimeChannel } from "@supabase/supabase-js";

const TABLE_TO_COLLECTION_MAP: Record<string, string> = {
  animals: "animals",
  vaccines: "vaccines",
  farms: "farms",
  animal_metrics_weight: "animal_metrics_weight",
  animal_metrics_ce: "animal_metrics_ce",
  animal_vaccines: "animal_vaccines",
  reproduction_events: "reproduction_events",
  animal_statuses: "animal_statuses",
  semen_doses: "semen_doses",
};

// Intervalos de polling (em ms)
const POLLING_INTERVAL = 30000; // 30 segundos
const RECONNECT_DELAY = 5000; // 5 segundos
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Hook melhorado para escutar mudanças no Supabase via Realtime e disparar sync no RxDB.
 * Inclui fallback de polling e reconexão automática para garantir sincronização confiável.
 */
export function useSupabaseRealtimeSync(db: MyDatabase | null) {
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isConnectedRef = useRef(false); // Ref para acessar estado sem causar re-render

  useEffect(() => {
    if (
      !db ||
      typeof (db as MyDatabase).replications !== "object" ||
      !(db as MyDatabase).replications
    ) {
      console.log("⚠️ [Realtime Sync] DB or replications not ready");
      return;
    }

    console.log(
      "📡 [Realtime Sync] Initializing Supabase Realtime listener..."
    );

    // We know db.replications exists due to previous checks, but the type system can't confirm it,
    // so we safely assert its type as Record<string, { reSync: () => void }>
    const replications = (
      db as { replications: Record<string, { reSync: () => void }> }
    ).replications;

    /**
     * Função para disparar sincronização em uma coleção
     */
    const triggerSync = (collectionName: string, tableName: string) => {
      if (!replications[collectionName]) {
        console.warn(
          `⚠️ [Realtime Sync] No replication found for collection: ${collectionName}`
        );
        return;
      }

      console.log(
        `🔔 [Realtime Sync] Change detected on table "${tableName}" → collection "${collectionName}". Triggering sync...`
      );

      try {
        replications[collectionName].reSync();
      } catch (error) {
        console.error(
          `❌ [Realtime Sync] Error triggering sync for ${collectionName}:`,
          error
        );
      }
    };

    /**
     * Função para disparar sincronização em todas as coleções
     */
    const triggerAllSyncs = (reason: string) => {
      console.log(`🔄 [Realtime Sync] Triggering all syncs: ${reason}`);
      Object.entries(replications).forEach(([name, rep]) => {
        if (rep && typeof rep.reSync === "function") {
          try {
            rep.reSync();
          } catch (error) {
            console.error(`❌ [Realtime Sync] Error syncing ${name}:`, error);
          }
        }
      });
    };

    /**
     * Inicializa o canal Realtime
     */
    const initializeRealtime = () => {
      // Remove canal anterior se existir
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.warn(
            "⚠️ [Realtime Sync] Error removing previous channel:",
            error
          );
        }
      }

      const channel = supabase
        .channel("db_changes", {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*", // INSERT, UPDATE, DELETE
            schema: "public",
          },
          (payload) => {
            const tableName = payload.table;
            const collectionName = TABLE_TO_COLLECTION_MAP[tableName];

            if (!collectionName) {
              console.warn(
                `⚠️ [Realtime Sync] Unknown table in event: ${tableName}. Payload:`,
                payload
              );
              return;
            }

            console.log(
              `📨 [Realtime Sync] Received event: ${payload.eventType} on table "${tableName}"`
            );

            triggerSync(collectionName, tableName);
          }
        )
        .subscribe((status) => {
          console.log(`📡 [Realtime Sync] Channel status: ${status}`);

          if (status === "SUBSCRIBED") {
            console.log(
              "✅ [Realtime Sync] Successfully subscribed to Postgres changes"
            );
            isConnectedRef.current = true;
            reconnectAttemptsRef.current = 0; // Reset tentativas

            // Cancela timeout de reconexão se existir
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
          }

          if (status === "CLOSED") {
            console.warn("🔌 [Realtime Sync] Connection closed");
            // Só agenda reconexão se não estivermos no cleanup
            if (channelRef.current) {
              isConnectedRef.current = false;
              scheduleReconnect();
            }
          }

          if (status === "CHANNEL_ERROR") {
            console.error("❌ [Realtime Sync] Channel error occurred");
            if (channelRef.current) {
              isConnectedRef.current = false;
              scheduleReconnect();
            }
          }

          if (status === "TIMED_OUT") {
            console.warn("⏱️ [Realtime Sync] Connection timed out");
            if (channelRef.current) {
              isConnectedRef.current = false;
              scheduleReconnect();
            }
          }
        });

      channelRef.current = channel;
      return channel;
    };

    /**
     * Agenda reconexão com backoff exponencial
     */
    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) {
        return; // Já existe uma reconexão agendada
      }

      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        console.error(
          `❌ [Realtime Sync] Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Falling back to polling only.`
        );
        return;
      }

      const delay = Math.min(
        RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
        30000 // Máximo de 30 segundos
      );

      console.log(
        `🔄 [Realtime Sync] Scheduling reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        console.log("🔄 [Realtime Sync] Attempting to reconnect...");
        initializeRealtime();
      }, delay);
    };

    // Inicializa o canal Realtime
    initializeRealtime();

    // Polling como fallback (executa mesmo quando Realtime está conectado,
    // mas menos frequente para reduzir carga)
    pollIntervalRef.current = setInterval(() => {
      if (!isConnectedRef.current) {
        console.log(
          "🔄 [Realtime Sync] Realtime disconnected, using polling fallback..."
        );
        triggerAllSyncs("polling fallback");
      } else {
        // Mesmo conectado, faz polling ocasional para garantir
        // (útil se algum evento for perdido)
        console.log("🔄 [Realtime Sync] Periodic sync check (backup)...");
        triggerAllSyncs("periodic check");
      }
    }, POLLING_INTERVAL);

    // Re-sync quando app volta ao foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("📱 [Realtime Sync] App foregrounded - triggering sync");
        triggerAllSyncs("app foregrounded");

        // Se não estiver conectado, tenta reconectar
        if (
          !isConnectedRef.current &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          console.log(
            "🔄 [Realtime Sync] App foregrounded and not connected - reinitializing..."
          );
          initializeRealtime();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Re-sync quando volta online
    const handleOnline = () => {
      console.log("🌐 [Realtime Sync] Network online - triggering sync");
      triggerAllSyncs("network online");

      // Tenta reconectar se não estiver conectado
      if (!isConnectedRef.current) {
        console.log(
          "🔄 [Realtime Sync] Network online but not connected - reinitializing..."
        );
        reconnectAttemptsRef.current = 0; // Reset tentativas
        initializeRealtime();
      }
    };

    window.addEventListener("online", handleOnline);

    // Cleanup
    return () => {
      console.log("🚫 [Realtime Sync] Cleaning up Realtime listener...");

      // Limpa timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Remove canal (set null antes para evitar reconexão durante cleanup)
      if (channelRef.current) {
        const channelToRemove = channelRef.current;
        channelRef.current = null; // Remove referência primeiro para evitar reconexão
        isConnectedRef.current = false;
        try {
          supabase.removeChannel(channelToRemove);
        } catch (error) {
          console.warn(
            "⚠️ [Realtime Sync] Error removing channel on cleanup:",
            error
          );
        }
      }

      // Remove event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);

      isConnectedRef.current = false;
      reconnectAttemptsRef.current = 0;
    };
  }, [db]); // Removido isConnected das dependências para evitar loops
}
