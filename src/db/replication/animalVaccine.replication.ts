import { createReplication } from "./base";
import { AnimalVaccine } from "@/types/vaccine.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Vacinas Aplicadas (AnimalVaccine) usando o template padronizado.
 */
export const animalVaccineReplication = createReplication<AnimalVaccine>({
  collectionName: "animal_vaccines",
  tableName: "animal_vaccines",
  replicationIdentifier: "animal-vaccines-replication-v11",

  mapToSupabase: (doc) => ({
    id: doc.id,
    rgn: doc.rgn,
    vaccine_id: doc.vaccine_id,
    date: doc.date ?? null,
    _deleted: doc._deleted,
  }),

  mapFromSupabase: (doc) => {
    return cleanSupabaseDocument(doc) as unknown as AnimalVaccine;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateAnimalVaccinesNew(
  db: Parameters<typeof animalVaccineReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return animalVaccineReplication(db, supabaseUrl, supabaseKey);
}
