import {
  replicateRxCollection,
  RxReplicationState,
} from "rxdb/plugins/replication";
import { MyDatabase } from "../../collections";
import {
  ReplicationConfig,
  ReplicableEntity,
  ReplicationCheckpoint,
} from "./types";
import {
  getAuthHeaders,
  cleanSupabaseDocuments,
} from "@/lib/supabase/auth-helper";

/**
 * Factory que cria uma função de replicação para uma entidade.
 *
 * Esta é a função principal do sistema de replicação padronizado.
 * Ela encapsula toda a lógica de pull/push em uma interface limpa.
 *
 * NOTA: A resolução de conflitos é feita via Supabase (merge-duplicates).
 * O conflictResolver passado na config é usado APENAS para logging.
 *
 * @example
 * // Definição da replicação
 * export const semenDoseReplication = createReplication<SemenDose>({
 *   collectionName: "semen_doses",
 *   tableName: "semen_doses",
 *   mapToSupabase: (doc) => ({
 *     id: doc.id,
 *     animal_name: doc.animal_name,
 *     // ... outros campos
 *   }),
 * });
 *
 * // Uso
 * const replication = await semenDoseReplication(db, supabaseUrl, supabaseKey);
 * replication.start();
 */
export function createReplication<T extends ReplicableEntity>(
  config: ReplicationConfig<T>
) {
  const {
    collectionName,
    tableName,
    replicationIdentifier = `${String(collectionName)}-replication-v1`,
    pullBatchSize = 1000,
    pushBatchSize = 1000,
    mapToSupabase,
    mapFromSupabase,
    retryTime = 5000,
    live = true,
    autoStart = false,
  } = config;

  // Retorna a factory function
  return async (
    db: MyDatabase,
    supabaseUrl: string,
    _supabaseKey: string // Mantido para compatibilidade, mas usamos getAuthHeaders
  ): Promise<RxReplicationState<T, ReplicationCheckpoint>> => {
    const collection = db[collectionName];

    console.log(
      `🔧 [${String(collectionName)}] Creating replication with config:`,
      {
        tableName,
        replicationIdentifier,
        pullBatchSize,
        pushBatchSize,
        live,
        autoStart,
      }
    );

    const replication = replicateRxCollection<T, ReplicationCheckpoint>({
      collection: collection as any,
      replicationIdentifier,

      // ==================== PULL (Supabase → RxDB) ====================
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified = checkpoint?.updated_at || "1970-01-01T00:00:00Z";
          const effectiveBatchSize = batchSize || pullBatchSize;

          console.log(
            `🔽 [${String(collectionName)}] Pulling from Supabase...`,
            {
              lastModified,
              batchSize: effectiveBatchSize,
              localCount: await collection.count().exec(),
            }
          );

          // Obtém headers com autenticação
          const headers = await getAuthHeaders();

          // Verifica se há token de autenticação
          if (!headers.Authorization) {
            console.warn(
              `⚠️ [${String(
                collectionName
              )}] No auth token available. Skipping pull.`
            );
            throw new Error("Authentication required for sync");
          }

          // Monta a URL da query
          const encodedDate = encodeURIComponent(lastModified);
          const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&order=updated_at.asc&limit=${effectiveBatchSize}&updated_at=gt.${encodedDate}`;

          const response = await fetch(url, { headers });

          if (!response.ok) {
            console.error(
              `❌ [${String(collectionName)}] Pull failed: ${response.status}`
            );
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const rawDocuments: Record<string, unknown>[] = Array.isArray(data)
            ? data
            : [];

          // Limpa valores null e aplica transformação customizada
          let documents: T[];
          if (mapFromSupabase) {
            documents = rawDocuments.map(mapFromSupabase);
          } else {
            // Limpa nulls e garante _deleted tem um valor
            const cleaned = cleanSupabaseDocuments(rawDocuments);
            documents = cleaned.map((doc) => ({
              ...doc,
              _deleted: doc._deleted ?? false,
            })) as T[];
          }

          console.log(
            `✅ [${String(collectionName)}] Received ${
              documents.length
            } documents`
          );

          // Calcula o novo checkpoint
          const newCheckpoint: ReplicationCheckpoint = {
            updated_at:
              rawDocuments.length > 0
                ? (rawDocuments[rawDocuments.length - 1].updated_at as string)
                : lastModified,
          };

          return {
            documents,
            checkpoint: newCheckpoint,
          };
        },
        batchSize: pullBatchSize,
      },

      // ==================== PUSH (RxDB → Supabase) ====================
      push: {
        async handler(rows) {
          console.log(
            `🔼 [${String(collectionName)}] PUSH triggered with ${
              rows.length
            } rows`
          );

          // Mapeia documentos para o formato do Supabase
          const documents = rows.map((row) => {
            const doc = row.newDocumentState as T;
            if (mapToSupabase) {
              return mapToSupabase(doc);
            }
            return doc as Record<string, unknown>;
          });

          console.log(`🔼 [${String(collectionName)}] Sending to Supabase:`, {
            count: documents.length,
            sampleKeys: documents[0] ? Object.keys(documents[0]) : [],
            sample: documents[0],
          });

          // Obtém headers com autenticação
          const headers = await getAuthHeaders();

          // Usa merge-duplicates para resolução de conflitos no Supabase
          const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
            method: "POST",
            headers: {
              ...headers,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [${String(collectionName)}] PUSH FAILED:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              documentsSent: documents.length,
            });
            throw new Error(`Push failed: ${response.status} - ${errorText}`);
          }

          console.log(
            `✅ [${String(collectionName)}] SUCCESSFULLY PUSHED ${
              documents.length
            } documents`
          );

          // Retorna array vazio indicando sucesso
          return [];
        },
        batchSize: pushBatchSize,
      },

      // ==================== OPTIONS ====================
      live,
      retryTime,
      autoStart,
    });

    replication.error$.subscribe((err) => {
      console.error(`❌ [Replication Error] ${String(collectionName)}:`, err);
    });

    return replication;
  };
}
