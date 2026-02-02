import { createReplication } from "./base";
import { AnimalSituation } from "@/types/situation.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

export const animalSituationReplication = createReplication<AnimalSituation>({
  collectionName: "animal_situations",
  tableName: "animal_situations",
  replicationIdentifier: "animal-situations-replication-v1",

  mapToSupabase: (doc) => ({
    id: doc.id,
    situation_name: doc.situation_name,
    _deleted: doc._deleted,
  }),

  mapFromSupabase: (doc) => {
    return cleanSupabaseDocument(doc) as unknown as AnimalSituation;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateAnimalSituationsNew(
  db: Parameters<typeof animalSituationReplication>[0],
  supabaseUrl: string,
  supabaseKey: string,
) {
  return animalSituationReplication(db, supabaseUrl, supabaseKey);
}
