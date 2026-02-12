import { createReplication } from "./base";
import { Exchange } from "@/types/exchange.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Trocas usando o template padronizado.
 */
export const exchangeReplication = createReplication<Exchange>({
  collectionName: "exchanges",
  tableName: "exchanges",
  replicationIdentifier: "exchanges-replication-v1",

  // Mapeia documento RxDB → Supabase
  mapToSupabase: (doc) => ({
    id: doc.id,
    animal_rgn: doc.animal_rgn,
    date: doc.date,
    client_id: doc.client_id,
    traded_animal_rgn: doc.traded_animal_rgn,
    substitute_animal_rgn: doc.substitute_animal_rgn || null,
    value_difference: doc.value_difference ?? 0,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),

  // Configurações
  pullBatchSize: 1000,
  pushBatchSize: 1000,
  retryTime: 5000,
  live: true,
  autoStart: false,

  mapFromSupabase: (doc) => {
    return cleanSupabaseDocument(doc) as unknown as Exchange;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateExchangesNew(
  db: Parameters<typeof exchangeReplication>[0],
  supabaseUrl: string,
  supabaseKey: string,
) {
  return exchangeReplication(db, supabaseUrl, supabaseKey);
}
