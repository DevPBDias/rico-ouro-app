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
import { SyncLogger } from "@/lib/sync/syncLogger";
import { PendingQueue } from "@/lib/sync/pendingQueue";

export function createReplication<T extends ReplicableEntity>(
  config: ReplicationConfig<T>,
) {
  const {
    collectionName,
    tableName,
    replicationIdentifier = `${String(collectionName)}-replication-v12`,
    pullBatchSize = 1000,
    pushBatchSize = 1000,
    mapToSupabase,
    mapFromSupabase,
    retryTime = 5000,
    live = true,
    autoStart = false,
  } = config;

  const colName = String(collectionName);

  return async (
    db: MyDatabase,
    supabaseUrl: string,
    _supabaseKey: string,
  ): Promise<RxReplicationState<T, ReplicationCheckpoint>> => {
    const collection = db[collectionName];

    SyncLogger.info(colName, "Creating replication", {
      tableName,
      replicationIdentifier,
      pullBatchSize,
      pushBatchSize,
      live,
      autoStart,
    });

    const replication = replicateRxCollection<T, ReplicationCheckpoint>({
      collection: collection as any,
      replicationIdentifier,

      // ==================== PULL (Supabase → RxDB) ====================
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified = checkpoint?.updated_at || 0;
          const lastId = checkpoint?.last_id || null;
          const effectiveBatchSize = batchSize || pullBatchSize;

          SyncLogger.info(colName, "Pulling from Supabase...", {
            lastModified,
            lastId,
            batchSize: effectiveBatchSize,
          });

          const headers = await getAuthHeaders();

          if (!headers.Authorization) {
            SyncLogger.error(
              colName,
              "No auth token available. Skipping pull.",
            );
            throw new Error("Authentication required for sync");
          }

          const primaryKey =
            (collection as any).schema.jsonSchema.primaryKey || "id";

          // CORREÇÃO: Preservar a string ISO original do Supabase para manter
          // precisão de microsegundos. Converter number → ISO apenas se necessário.
          let lastModifiedISO: string;
          if (typeof lastModified === "string") {
            // Já é string ISO vinda do Supabase — usar como está (preserva microsegundos)
            lastModifiedISO = lastModified;
          } else if (lastModified === 0) {
            lastModifiedISO = new Date(0).toISOString();
          } else {
            lastModifiedISO = new Date(lastModified).toISOString();
          }

          const filter = lastId
            ? `or(updated_at.gt."${lastModifiedISO}",and(updated_at.eq."${lastModifiedISO}",${primaryKey}.gt."${lastId}"))`
            : `updated_at.gte."${lastModifiedISO}"`;

          const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&order=updated_at.asc,${primaryKey}.asc&limit=${effectiveBatchSize}&${filter}`;

          const response = await fetch(url, { headers });

          if (!response.ok) {
            const errorText = await response.text();
            SyncLogger.error(
              colName,
              `Pull failed: ${response.status}`,
              errorText,
            );
            throw new Error(`Pull failed: ${response.status}`);
          }

          const rawDocuments: Record<string, any>[] = await response.json();
          const data = Array.isArray(rawDocuments) ? rawDocuments : [];

          // Processar documentos para o RxDB
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

          SyncLogger.info(
            colName,
            `Received ${processedDocuments.length} documents`,
          );

          // CORREÇÃO CRÍTICA: Usar o updated_at RAW do Supabase (string com microsegundos)
          // para o checkpoint, NÃO o valor convertido para number (que perde precisão).
          // Isso evita o loop infinito de pull.
          const lastRawDoc = data.length > 0 ? data[data.length - 1] : null;
          const newCheckpoint: ReplicationCheckpoint = {
            updated_at: lastRawDoc
              ? lastRawDoc.updated_at // String ISO com precisão total do Supabase
              : lastModified,
            last_id: lastRawDoc ? String(lastRawDoc[primaryKey]) : lastId,
          };

          if (data.length > 0) {
            SyncLogger.info(colName, "Checkpoint advanced", {
              updated_at: newCheckpoint.updated_at,
              last_id: newCheckpoint.last_id,
              docsInBatch: data.length,
              hasMore: data.length >= effectiveBatchSize,
            });
          }

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
          SyncLogger.info(colName, `PUSH triggered with ${rows.length} rows`);

          const primaryKey =
            (collection as any).schema.jsonSchema.primaryKey || "id";

          // Marcar docs como syncing no PendingQueue
          rows.forEach((row) => {
            const docId = String((row.newDocumentState as any)[primaryKey]);
            PendingQueue.add(colName, docId);
            PendingQueue.markSyncing(colName, docId);
          });

          const documents = rows.map((row) => {
            const doc = row.newDocumentState as T;

            // Garantir que updated_at existe
            if (!doc.updated_at) {
              SyncLogger.warn(
                colName,
                "Document missing updated_at, adding now",
              );
              (doc as any).updated_at = Date.now();
            }

            let mapped = mapToSupabase
              ? mapToSupabase(doc)
              : { ...(doc as Record<string, any>) };

            // SEMPRE converter timestamps numéricos para ISO antes de enviar ao Supabase
            if (typeof mapped.updated_at === "number") {
              mapped.updated_at = new Date(
                mapped.updated_at as number,
              ).toISOString();
            }
            if (typeof mapped.created_at === "number") {
              mapped.created_at = new Date(
                mapped.created_at as number,
              ).toISOString();
            }

            return mapped;
          });

          const headers = await getAuthHeaders();

          if (!headers.Authorization) {
            SyncLogger.error(
              colName,
              "No auth token for push. Session may have expired.",
            );

            rows.forEach((row) => {
              const docId = String((row.newDocumentState as any)[primaryKey]);
              PendingQueue.markError(colName, docId, "No auth token");
            });

            throw new Error("Authentication required for sync");
          }

          SyncLogger.info(
            colName,
            `Pushing ${documents.length} docs to Supabase...`,
          );

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

            rows.forEach((row) => {
              const docId = String((row.newDocumentState as any)[primaryKey]);
              PendingQueue.markError(
                colName,
                docId,
                `Push failed: ${response.status}`,
              );
            });

            SyncLogger.error(
              colName,
              `Push failed: ${response.status}`,
              errorText,
            );
            throw new Error(`Push failed: ${response.status} - ${errorText}`);
          }

          const responseData = await response.json();
          const updatedDocs = Array.isArray(responseData) ? responseData : [];

          // Marcar todos como synced
          rows.forEach((row) => {
            const docId = String((row.newDocumentState as any)[primaryKey]);
            PendingQueue.markSynced(colName, docId);
          });

          SyncLogger.info(
            colName,
            `Push successful: ${updatedDocs.length} docs synced ✅`,
          );

          if (updatedDocs.length > 0) {
            const mappedResults = updatedDocs.map((doc) => {
              if (mapFromSupabase) return mapFromSupabase(doc);
              const cleaned = cleanSupabaseDocument(doc);
              return {
                ...cleaned,
                _deleted: cleaned._deleted ?? false,
              } as T;
            });
            return mappedResults;
          }

          return [];
        },
        batchSize: pushBatchSize,
      },

      live,
      retryTime,
      autoStart,
    });

    return replication;
  };
}
