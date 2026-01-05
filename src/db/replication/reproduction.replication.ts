import { createReplication } from "./base";
import { ReproductionEvent } from "@/types/reproduction_event.type";

/**
 * Replicação de Eventos Reprodutivos usando o template padronizado.
 */
export const reproductionEventReplication = createReplication<ReproductionEvent>({
  collectionName: "reproduction_events",
  tableName: "reproduction_events",
  replicationIdentifier: "reproduction-events-replication-v2", // Incrementado

  mapToSupabase: (doc) => ({
    id: doc.id,
    rgn: doc.rgn,
    type: doc.type,
    date: doc.date ?? null,
    weight: doc.weight ?? null,
    bull: doc.bull ?? null,
    donor: doc.donor ?? null,
    rgn_bull: doc.rgn_bull ?? null,
    gestation_diagnostic_date: doc.gestation_diagnostic_date ?? null,
    gestation_diagnostic_type: doc.gestation_diagnostic_type ?? null,
    expected_sex: doc.expected_sex ?? null,
    expected_birth_date_270: doc.expected_birth_date_270 ?? null,
    expected_birth_date_305: doc.expected_birth_date_305 ?? null,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateReproductionEventsNew(
  db: Parameters<typeof reproductionEventReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return reproductionEventReplication(db, supabaseUrl, supabaseKey);
}
