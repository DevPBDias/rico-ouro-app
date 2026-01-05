import { createReplication } from "./base";
import { Farm } from "@/types/farm.type";

/**
 * Replicação de Fazendas usando o template padronizado.
 */
export const farmReplication = createReplication<Farm>({
  collectionName: "farms",
  tableName: "farms",
  replicationIdentifier: "farms-replication-v2", // Incrementado

  mapToSupabase: (doc) => ({
    id: doc.id,
    farm_name: doc.farm_name,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateFarmsNew(
  db: Parameters<typeof farmReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return farmReplication(db, supabaseUrl, supabaseKey);
}
