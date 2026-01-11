import { createReplication } from "./base";
import { AnimalStatus } from "@/types/status.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Status de Animais usando o template padronizado.
 */
export const animalStatusReplication = createReplication<AnimalStatus>({
  collectionName: "animal_statuses",
  tableName: "animal_statuses",
  replicationIdentifier: "animal-statuses-replication-v10",

  mapToSupabase: (doc) => ({
    id: doc.id,
    status_name: doc.status_name,
    _deleted: doc._deleted,
  }),

  mapFromSupabase: (doc) => {
    return cleanSupabaseDocument(doc) as unknown as AnimalStatus;
  },
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
