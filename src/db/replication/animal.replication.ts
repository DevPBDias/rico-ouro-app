import { createReplication } from "./base";
import { Animal } from "@/types/animal.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Interface estendida de Animal que garante campos de replicação.
 *
 * Animal já tem _deleted e updated_at definidos no tipo original,
 * mas precisamos garantir que são obrigatórios para a replicação.
 */
interface ReplicableAnimal extends Omit<Animal, "_deleted" | "updated_at"> {
  updated_at: string;
  _deleted: boolean;
}

/**
 * Replicação de Animais usando o template padronizado.
 *
 * Esta entidade usa:
 * - Primary Key: rgn (não UUID - exceção histórica)
 * - Todos os campos são mapeados explicitamente para o Supabase
 */
export const animalReplication = createReplication<ReplicableAnimal>({
  collectionName: "animals",
  tableName: "animals",
  replicationIdentifier: "animals-replication-v2", // Incrementado para nova versão

  // Mapeia documento RxDB → Supabase
  // Normaliza todos os campos para valores válidos do PostgreSQL
  mapToSupabase: (doc) => ({
    rgn: doc.rgn,
    name: doc.name ?? null,
    sex: doc.sex ?? null,
    born_date: doc.born_date ?? null,
    serie_rgd: doc.serie_rgd ?? null,
    born_color: doc.born_color ?? null,
    iabcgz: doc.iabcgz ?? null,
    deca: doc.deca ?? null,
    p: doc.p ?? null,
    f: doc.f ?? null,
    status: doc.status ?? null,
    farm_id: doc.farm_id ?? null,
    type: doc.type ?? null,
    genotyping: doc.genotyping ?? null,
    condition: doc.condition ?? null,
    classification: doc.classification ?? null,
    parturition_from: doc.parturition_from ?? null,
    father_name: doc.father_name ?? null,
    mother_serie_rgd: doc.mother_serie_rgd ?? null,
    mother_rgn: doc.mother_rgn ?? null,
    maternal_grandfather_name: doc.maternal_grandfather_name ?? null,
    paternal_grandfather_name: doc.paternal_grandfather_name ?? null,
    partnership: doc.partnership ?? null,
    _deleted: doc._deleted,
  }),

  // Configurações
  pullBatchSize: 1000,
  pushBatchSize: 1000,
  retryTime: 5000,
  live: true,
  autoStart: false,

  mapFromSupabase: (doc) => {
    const cleaned = cleanSupabaseDocument(doc);
    delete cleaned.id; // Remove Supabase-specific ID as we use rgn
    return cleaned as unknown as ReplicableAnimal;
  },
});

/**
 * Função wrapper para compatibilidade com o sistema atual.
 */
export async function replicateAnimalsNew(
  db: Parameters<typeof animalReplication>[0],
  supabaseUrl: string,
  supabaseKey: string
) {
  return animalReplication(db, supabaseUrl, supabaseKey);
}
