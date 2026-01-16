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
  const POLLING_INTERVAL_ACTIVE = 5000; // 5 segundos quando app está ativo (reduzido para testes)
  const POLLING_INTERVAL_INACTIVE = 30000; // 30 segundos quando app está inativo
  const INITIAL_SYNC_DELAY = 1000; // 1 segundo após inicialização (reduzido)

  useEffect(() => {
    console.log("🔍 [Polling Sync] Hook effect triggered", {
      hasDb: !!db,
      hasReplications: !!(
        db as MyDatabase & { replications?: Record<string, unknown> }
      )?.replications,
      replicationsKeys: db
        ? Object.keys(
            (db as MyDatabase & { replications?: Record<string, unknown> })
              ?.replications || {}
          )
        : [],
    });

    if (
      !db ||
      typeof (db as MyDatabase).replications !== "object" ||
      !(db as MyDatabase).replications
    ) {
      console.warn("⚠️ [Polling Sync] DB or replications not ready", {
        db: !!db,
        replications: !!(
          db as MyDatabase & { replications?: Record<string, unknown> }
        )?.replications,
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
        replicationCount: Object.keys(replications).length,
        replicationNames: Object.keys(replications),
      });

      let syncCount = 0;
      let errorCount = 0;

      Object.entries(replications).forEach(([name, rep]) => {
        if (!rep) {
          console.warn(
            `⚠️ [Polling Sync] Replication ${name} is null/undefined`
          );
          return;
        }

        if (typeof rep.reSync !== "function") {
          console.error(
            `❌ [Polling Sync] reSync is not a function for ${name}`,
            { type: typeof rep.reSync, replication: rep }
          );
          errorCount++;
          return;
        }

        try {
          console.log(`🔄 [Polling Sync] Calling reSync() for ${name}...`);
          rep.reSync();
          syncCount++;
          console.log(
            `✅ [Polling Sync] reSync() called successfully for ${name}`
          );
        } catch (error) {
          console.error(`❌ [Polling Sync] Error syncing ${name}:`, error);
          errorCount++;
        }
      });

      console.log(`📊 [Polling Sync] Sync summary:`, {
        total: Object.keys(replications).length,
        successful: syncCount,
        errors: errorCount,
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
        const syncReason = isAppActiveRef.current
          ? "periodic sync (active)"
          : "periodic sync (inactive)";
        console.log(`🔄 [Polling Sync] ${syncReason} - interval triggered`);
        triggerAllSyncs(syncReason);
      }, interval);

      console.log(
        `✅ [Polling Sync] Polling interval set to ${interval / 1000}s`
      );
    };

    // Sincronização inicial após delay
    console.log(
      `⏳ [Polling Sync] Scheduling initial sync in ${INITIAL_SYNC_DELAY}ms...`
    );
    initialSyncTimeoutRef.current = setTimeout(() => {
      console.log("🔄 [Polling Sync] Initial sync after startup...");
      triggerAllSyncs("initial sync");
      setupPolling();
      initialSyncTimeoutRef.current = null;
    }, INITIAL_SYNC_DELAY);

    // Também força uma sincronização imediata se o banco já estiver pronto
    // (útil se o hook for chamado depois que o banco já está inicializado)
    if (Object.keys(replications).length > 0) {
      console.log(
        "🔄 [Polling Sync] Replications already available, triggering immediate sync in 500ms..."
      );
      setTimeout(() => {
        triggerAllSyncs("immediate sync (replications ready)");
      }, 500);
    }

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
