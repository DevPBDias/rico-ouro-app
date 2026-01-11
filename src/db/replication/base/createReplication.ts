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
  cleanSupabaseDocument,
} from "@/lib/supabase/auth-helper";

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
          const lastId = checkpoint?.last_id || null;
          const effectiveBatchSize = batchSize || pullBatchSize;

          console.log(
            `🔽 [${String(collectionName)}] Pulling from Supabase...`,
            {
              lastModified,
              lastId,
              batchSize: effectiveBatchSize,
            }
          );

          // Obtém headers com autenticação
          const headers = await getAuthHeaders();

          if (!headers.Authorization) {
            console.warn(
              `⚠️ [${String(
                collectionName
              )}] No auth token available. Skipping pull.`
            );
            throw new Error("Authentication required for sync");
          }

          // Monta a URL da query
          // Usamos gte para updated_at para garantir que não perdemos registros com o mesmo timestamp,
          // e depois filtramos o lastId se necessário.
          const encodedDate = encodeURIComponent(lastModified);
          const primaryKey =
            (collection as any).schema.jsonSchema.primaryKey || "id";

          let url = `${supabaseUrl}/rest/v1/${tableName}?select=*&order=updated_at.asc,${primaryKey}.asc&limit=${effectiveBatchSize}&updated_at=gte.${encodedDate}`;

          const response = await fetch(url, { headers });

          if (!response.ok) {
            console.error(
              `❌ [${String(collectionName)}] Pull failed: ${response.status}`
            );
            throw new Error(`Pull failed: ${response.status}`);
          }

          const rawDocuments: Record<string, any>[] = await response.json();
          let data = Array.isArray(rawDocuments) ? rawDocuments : [];

          // Se o primeiro item do batch for exatamente o último que já vimos (mesmo updated_at e mesmo ID), removemos ele.
          if (
            data.length > 0 &&
            lastId &&
            data[0].updated_at === lastModified &&
            data[0][primaryKey] === lastId
          ) {
            data.shift();
          }

          // Limpa valores null e aplica transformação customizada
          const processedDocuments = data.map((doc) => {
            if (mapFromSupabase) {
              return mapFromSupabase(doc);
            }
            const cleaned = cleanSupabaseDocuments([doc])[0];
            return {
              ...cleaned,
              _deleted: cleaned._deleted ?? false,
            } as T;
          });

          console.log(
            `✅ [${String(collectionName)}] Received ${
              processedDocuments.length
            } documents`
          );

          // Calcula o novo checkpoint
          // Precisamos do ID do último documento para desempatar no próximo pull
          const lastDoc = data.length > 0 ? data[data.length - 1] : null;
          const newCheckpoint: ReplicationCheckpoint = {
            updated_at: lastDoc ? lastDoc.updated_at : lastModified,
            last_id: lastDoc ? lastDoc[primaryKey] : lastId,
          };

          return {
            documents: processedDocuments,
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
          // Prefer: return=representation nos ajuda a obter o updated_at gerado pelo servidor
          const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
            method: "POST",
            headers: {
              ...headers,
              Prefer: "resolution=merge-duplicates,return=representation",
            },
            body: JSON.stringify(documents),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [${String(collectionName)}] PUSH FAILED:`, {
              status: response.status,
              error: errorText,
            });
            throw new Error(`Push failed: ${response.status} - ${errorText}`);
          }

          const responseData = await response.json();
          const updatedDocs = Array.isArray(responseData) ? responseData : [];

          console.log(
            `✅ [${String(collectionName)}] SUCCESSFULLY PUSHED ${
              documents.length
            } documents. Server replied with ${
              updatedDocs.length
            } updated docs.`
          );

          // Se o servidor retornou os documentos atualizados (com updated_at),
          // retornamos eles para que o RxDB atualize o estado local
          if (updatedDocs.length > 0) {
            const mappedResults = updatedDocs.map((doc) => {
              if (mapFromSupabase) return mapFromSupabase(doc);
              const cleaned = cleanSupabaseDocument(doc);
              return { ...cleaned, _deleted: cleaned._deleted ?? false } as T;
            });
            return mappedResults;
          }

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
