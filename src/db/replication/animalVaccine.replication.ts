import { createReplication } from "./base";
import { AnimalVaccine } from "@/types/vaccine.type";

/**
 * Replicação de Vacinas Aplicadas (AnimalVaccine) usando o template padronizado.
 */
export const animalVaccineReplication = createReplication<AnimalVaccine>({
  collectionName: "animal_vaccines",
  tableName: "animal_vaccines",
  replicationIdentifier: "animal-vaccines-replication-v2", // Incrementado

  mapToSupabase: (doc) => ({
    id: doc.id,
    rgn: doc.rgn,
    vaccine_id: doc.vaccine_id,
    date: doc.date ?? null,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),
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
