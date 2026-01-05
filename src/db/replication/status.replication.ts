import { createReplication } from "./base";
import { AnimalStatus } from "@/types/status.type";

/**
 * Replicação de Status de Animais usando o template padronizado.
 */
export const animalStatusReplication = createReplication<AnimalStatus>({
  collectionName: "animal_statuses",
  tableName: "animal_statuses",
  replicationIdentifier: "animal-statuses-replication-v2", // Incrementado

  mapToSupabase: (doc) => ({
    id: doc.id,
    status_name: doc.status_name,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateAnimalStatusesNew(
  db: Parameters<typeof animalStatusReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return animalStatusReplication(db, supabaseUrl, supabaseKey);
}
