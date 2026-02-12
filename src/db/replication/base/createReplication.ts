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
  config: ReplicationConfig<T>,
) {
  const {
    collectionName,
    tableName,
    replicationIdentifier = `${String(collectionName)}-replication-v11`, // v11 for clean start after timestamptz change
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
    _supabaseKey: string,
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
      },
    );

    const replication = replicateRxCollection<T, ReplicationCheckpoint>({
      collection: collection as any,
      replicationIdentifier,

      // ==================== PULL (Supabase → RxDB) ====================
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified = checkpoint?.updated_at || 0;
          const lastId = checkpoint?.last_id || null;
          const effectiveBatchSize = batchSize || pullBatchSize;

          console.log(
            `🔽 [${String(collectionName)}] Pulling from Supabase...`,
            {
              lastModified,
              lastId,
              batchSize: effectiveBatchSize,
            },
          );

          const headers = await getAuthHeaders();

          if (!headers.Authorization) {
            console.warn(
              `⚠️ [${String(
                collectionName,
              )}] No auth token available. Skipping pull.`,
            );
            throw new Error("Authentication required for sync");
          }

          const primaryKey =
            (collection as any).schema.jsonSchema.primaryKey || "id";

          // Cursor composto real para garantir progressão e evitar duplicados
          // PostgREST: (updated_at, id) > (last_modified, last_id)
          // Convertendo lastModified (ms) para ISO string para compatibilidade com timestamptz
          const lastModifiedISO = (typeof lastModified === 'number')
            ? new Date(lastModified).toISOString()
            : lastModified;

          const filter = lastId
            ? `or(updated_at.gt."${lastModifiedISO}",and(updated_at.eq."${lastModifiedISO}",${primaryKey}.gt."${lastId}"))`
            : `updated_at.gte."${lastModifiedISO}"`;

          let url = `${supabaseUrl}/rest/v1/${tableName}?select=*&order=updated_at.asc,${primaryKey}.asc&limit=${effectiveBatchSize}&${filter}`;

          console.log(
            `🔗 [${String(collectionName)}] Pull URL:`,
            url.substring(0, 200) + (url.length > 200 ? "..." : ""),
          );

          const response = await fetch(url, { headers });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `❌ [${String(collectionName)}] Pull failed: ${response.status}`,
              errorText,
            );
            throw new Error(`Pull failed: ${response.status}`);
          }

          const rawDocuments: Record<string, any>[] = await response.json();
          let data = Array.isArray(rawDocuments) ? rawDocuments : [];

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
            } unique documents`,
          );

          // USAR processedDocuments em vez de data para o checkpoint,
          // pois cleanSupabaseDocuments já converteu ISO strings para números (ms)
          const lastDoc =
            processedDocuments.length > 0
              ? processedDocuments[processedDocuments.length - 1]
              : null;
          const newCheckpoint: ReplicationCheckpoint = {
            updated_at: lastDoc
              ? Number((lastDoc as any).updated_at)
              : lastModified,
            last_id: lastDoc ? String((lastDoc as any)[primaryKey]) : lastId,
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
            } rows`,
          );

          const documents = rows.map((row) => {
            const doc = row.newDocumentState as T;
            let mapped = mapToSupabase ? mapToSupabase(doc) : { ...doc as Record<string, any> };
            
            // Garantir que timestamps técnicos sejam enviados como ISO strings para timestamptz
            if (typeof mapped.updated_at === 'number') {
              mapped.updated_at = new Date(mapped.updated_at).toISOString();
            }
            if (typeof mapped.created_at === 'number') {
              mapped.created_at = new Date(mapped.created_at).toISOString();
            }
            
            return mapped;
          });

          const headers = await getAuthHeaders();

          if (!headers.Authorization) {
            console.warn(
              `⚠️ [${String(collectionName)}] No auth token for push.`,
            );
            throw new Error("Authentication required for sync");
          }

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
            throw new Error(`Push failed: ${response.status} - ${errorText}`);
          }

          const responseData = await response.json();
          const updatedDocs = Array.isArray(responseData) ? responseData : [];

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

      live,
      retryTime,
      autoStart,
    });

    return replication;
  };
}
