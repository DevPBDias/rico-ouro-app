import { createReplication } from "./base";
import { Client } from "@/types/client.type";
import { cleanSupabaseDocument } from "@/lib/supabase/auth-helper";

/**
 * Replicação de Clientes usando o template padronizado.
 */
export const clientReplication = createReplication<Client>({
  collectionName: "clients",
  tableName: "clients",
  replicationIdentifier: "clients-replication-v2",

  // Mapeia documento RxDB → Supabase
  mapToSupabase: (doc) => ({
    id: doc.id,
    name: doc.name,
    cpf_cnpj: doc.cpf_cnpj,
    inscricao_estadual: doc.inscricao_estadual ?? null,
    phone: doc.phone ?? null,
    farm: doc.farm ?? null,
    city: doc.city ?? null,
    email: doc.email ?? null,
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
    return cleanSupabaseDocument(doc) as unknown as Client;
  },
});

/**
 * Função wrapper para compatibilidade.
 */
export async function replicateClientsNew(
  db: Parameters<typeof clientReplication>[0],
  supabaseUrl: string,
  supabaseKey: string,
) {
  return clientReplication(db, supabaseUrl, supabaseKey);
}
