import { createReplication } from "./base";
import { Death } from "@/types/death.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Mortes usando o template padronizado.
 */
export const deathReplication = createReplication<Death>({
  collectionName: "deaths",
  tableName: "deaths",
  replicationIdentifier: "deaths-replication-v1",

  // Mapeia documento RxDB → Supabase
  mapToSupabase: (doc) => ({
    id: doc.id,
    animal_rgn: doc.animal_rgn,
    date: doc.date,
    reason: doc.reason,
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
    return cleanSupabaseDocument(doc) as unknown as Death;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateDeathsNew(
  db: Parameters<typeof deathReplication>[0],
  supabaseUrl: string,
  supabaseKey: string,
) {
  return deathReplication(db, supabaseUrl, supabaseKey);
}
