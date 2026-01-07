import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { MyDatabase } from "@/db/collections";

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

/**
 * Hook para escutar mudanças no Supabase via Realtime e disparar sync no RxDB.
 * Otimizado para o Free Tier: usa um único canal e apenas notifica a mudança.
 */
export function useSupabaseRealtimeSync(db: MyDatabase | null) {
  useEffect(() => {
    if (!db || !(db as any).replications) return;

    console.log("📡 [Realtime Sync] Initializing Supabase Realtime listener...");

    const replications = (db as any).replications;

    // Subscreve a mudanças em todas as tabelas mapeadas
    const channel = supabase
      .channel("db_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
        },
        (payload) => {
          const tableName = payload.table;
          const collectionName = TABLE_TO_COLLECTION_MAP[tableName];

          if (collectionName && replications[collectionName]) {
            console.log(`🔔 [Realtime Sync] Change detected on table "${tableName}". Triggering incremental pull...`);
            
            // Dispara o pulling incremental do RxDB
            replications[collectionName].reSync();
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ [Realtime Sync] Subscribed to Postgres changes");
        }
        if (status === "CLOSED") {
           console.log("🔌 [Realtime Sync] Connection closed");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("❌ [Realtime Sync] Channel error");
        }
      });

    // Lida com visibilidade da página (re-sync ao voltar para o app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("📱 [Realtime Sync] App foregrounded - Triggering full re-sync");
        Object.values(replications).forEach((rep: any) => {
          if (rep && typeof rep.reSync === "function") rep.reSync();
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      console.log("🚫 [Realtime Sync] Cleaning up Realtime listener...");
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [db]);
}
