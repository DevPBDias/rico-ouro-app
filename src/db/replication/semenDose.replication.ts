import { createReplication } from "./base";
import { SemenDose } from "@/types/semen_dose.type";

/**
 * Replicação de Doses de Sêmen usando o template padronizado.
 *
 * Esta entidade usa:
 * - Primary Key: id (UUID)
 * - Todos os campos são mapeados explicitamente para o Supabase
 */
export const semenDoseReplication = createReplication<SemenDose>({
  collectionName: "semen_doses",
  tableName: "semen_doses",
  replicationIdentifier: "semen-doses-replication-v5", // Incrementado para nova versão

  // Mapeia documento RxDB → Supabase
  // Garante que todos os campos estejam no formato correto
  mapToSupabase: (doc) => ({
    id: doc.id,
    animal_name: doc.animal_name,
    animal_image: doc.animal_image ?? null,
    father_name: doc.father_name ?? null,
    maternal_grandfather_name: doc.maternal_grandfather_name ?? null,
    iabcz: doc.iabcz ?? null,
    registration: doc.registration ?? null,
    center_name: doc.center_name ?? null,
    breed: doc.breed,
    quantity: doc.quantity,
    updated_at: doc.updated_at,
    _deleted: doc._deleted,
  }),

  // Configurações padrão
  pullBatchSize: 1000,
  pushBatchSize: 1000,
  retryTime: 5000,
  live: true,
  autoStart: false,
});

/**
 * Função wrapper para compatibilidade com o sistema atual.
 *
 * O sistema atual chama: replicateSemenDoses(db, url, key)
 * O novo template retorna uma factory, então precisamos deste wrapper.
 */
export async function replicateSemenDosesNew(
  db: Parameters<typeof semenDoseReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return semenDoseReplication(db, supabaseUrl, supabaseKey);
}
