import { createReplication } from "./base";
import { Vaccine } from "@/types/vaccine.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Tipos de Vacinas usando o template padronizado.
 */
export const vaccineReplication = createReplication<Vaccine>({
  collectionName: "vaccines",
  tableName: "vaccines",
  replicationIdentifier: "vaccines-replication-v2", // Incrementado

  mapToSupabase: (doc) => ({
    id: doc.id,
    vaccine_name: doc.vaccine_name,
    _deleted: doc._deleted,
  }),

  mapFromSupabase: (doc) => {
    return cleanSupabaseDocument(doc) as unknown as Vaccine;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateVaccinesNew(
  db: Parameters<typeof vaccineReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return vaccineReplication(db, supabaseUrl, supabaseKey);
}
