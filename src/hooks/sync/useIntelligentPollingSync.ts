import { useEffect, useRef } from "react";
import { MyDatabase } from "@/db/collections";

/**
 * Sistema de sincronização inteligente baseado em polling adaptativo.
 * Substitui o Supabase Realtime por uma solução mais confiável e controlável.
 *
 * Características:
 * - Polling adaptativo baseado no estado do app (ativo/inativo)
 * - Sincronização imediata quando app volta ao foreground
 * - Sincronização imediata quando rede volta online
 * - Usa checkpoints do RxDB para sincronização incremental eficiente
 * - Evita polling desnecessário quando app está em background
 */
export function useIntelligentPollingSync(db: MyDatabase | null) {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAppActiveRef = useRef(true);
  const lastSyncTimeRef = useRef<Date>(new Date());

  // Intervalos de polling (em ms)
  const POLLING_INTERVAL_ACTIVE = 10000; // 10 segundos quando app está ativo
  const POLLING_INTERVAL_INACTIVE = 60000; // 60 segundos quando app está inativo
  const INITIAL_SYNC_DELAY = 2000; // 2 segundos após inicialização

  useEffect(() => {
    console.log("🔍 [Polling Sync] Hook effect triggered", {
      hasDb: !!db,
      hasReplications: !!(db as any)?.replications,
      replicationsKeys: db ? Object.keys((db as any)?.replications || {}) : [],
    });

    if (
      !db ||
      typeof (db as MyDatabase).replications !== "object" ||
      !(db as MyDatabase).replications
    ) {
      console.warn("⚠️ [Polling Sync] DB or replications not ready", {
        db: !!db,
        replications: !!(db as any)?.replications,
      });
      return;
    }

    console.log("📡 [Polling Sync] Initializing intelligent polling sync...");

    const replications = (
      db as { replications: Record<string, { reSync: () => void }> }
    ).replications;

    /**
     * Função para disparar sincronização em todas as coleções
     */
    const triggerAllSyncs = (reason: string) => {
      const now = new Date();
      const timeSinceLastSync =
        now.getTime() - lastSyncTimeRef.current.getTime();

      console.log(`🔄 [Polling Sync] Triggering all syncs: ${reason}`, {
        timeSinceLastSync: `${Math.round(timeSinceLastSync / 1000)}s`,
        isAppActive: isAppActiveRef.current,
      });

      Object.entries(replications).forEach(([name, rep]) => {
        if (rep && typeof rep.reSync === "function") {
          try {
            rep.reSync();
          } catch (error) {
            console.error(`❌ [Polling Sync] Error syncing ${name}:`, error);
          }
        }
      });

      lastSyncTimeRef.current = now;
    };

    /**
     * Configura polling adaptativo baseado no estado do app
     */
    const setupPolling = () => {
      // Limpa polling anterior se existir
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      const interval = isAppActiveRef.current
        ? POLLING_INTERVAL_ACTIVE
        : POLLING_INTERVAL_INACTIVE;

      console.log(
        `⏱️ [Polling Sync] Setting up polling with ${
          interval / 1000
        }s interval (${isAppActiveRef.current ? "active" : "inactive"})`
      );

      pollIntervalRef.current = setInterval(() => {
        if (isAppActiveRef.current) {
          console.log("🔄 [Polling Sync] Periodic sync (app active)...");
          triggerAllSyncs("periodic sync (active)");
        } else {
          console.log("🔄 [Polling Sync] Periodic sync (app inactive)...");
          triggerAllSyncs("periodic sync (inactive)");
        }
      }, interval);
    };

    // Sincronização inicial após delay
    initialSyncTimeoutRef.current = setTimeout(() => {
      console.log("🔄 [Polling Sync] Initial sync after startup...");
      triggerAllSyncs("initial sync");
      setupPolling();
      initialSyncTimeoutRef.current = null;
    }, INITIAL_SYNC_DELAY);

    // Detecta quando app volta ao foreground
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      const wasActive = isAppActiveRef.current;
      isAppActiveRef.current = isVisible;

      if (isVisible && !wasActive) {
        console.log(
          "📱 [Polling Sync] App foregrounded - triggering immediate sync"
        );
        triggerAllSyncs("app foregrounded");
        setupPolling(); // Reconfigura polling para intervalo ativo
      } else if (!isVisible && wasActive) {
        console.log(
          "📱 [Polling Sync] App backgrounded - switching to slower polling"
        );
        setupPolling(); // Reconfigura polling para intervalo inativo
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Detecta quando rede volta online
    const handleOnline = () => {
      console.log(
        "🌐 [Polling Sync] Network online - triggering immediate sync"
      );
      triggerAllSyncs("network online");

      // Se app estava inativo, reativa polling mais frequente
      if (!isAppActiveRef.current) {
        isAppActiveRef.current = true;
        setupPolling();
      }
    };

    window.addEventListener("online", handleOnline);

    // Detecta quando rede fica offline
    const handleOffline = () => {
      console.log("🌐 [Polling Sync] Network offline - pausing sync");
      // Não faz nada, o RxDB vai tentar novamente quando voltar online
    };

    window.addEventListener("offline", handleOffline);

    // Detecta quando página recebe foco (útil para abas do navegador)
    const handleFocus = () => {
      if (isAppActiveRef.current) {
        console.log("👁️ [Polling Sync] Window focused - triggering sync");
        triggerAllSyncs("window focused");
      }
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      console.log("🚫 [Polling Sync] Cleaning up polling sync...");

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (initialSyncTimeoutRef.current) {
        clearTimeout(initialSyncTimeoutRef.current);
        initialSyncTimeoutRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
    };
  }, [db]);
}
