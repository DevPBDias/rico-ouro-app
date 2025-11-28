import {
  RxCollection,
  ReplicationPullOptions,
  ReplicationPushOptions,
  WithDeleted,
} from "rxdb";
import { replicateRxCollection } from "rxdb/plugins/replication";

// --------------------------------------------------------------
// 🟦 Tipos genéricos utilizados para replicação
// --------------------------------------------------------------

export interface BaseDocument {
  uuid?: string;
  _modified?: string;
  _deleted?: boolean;
}

export interface PullResult<T> {
  documents: T[];
  checkpoint: { _modified: string | null };
}

export interface PushRow<T> {
  newDocumentState: T;
}

export interface PushResponse {
  error?: string;
}

// --------------------------------------------------------------
// 🟧 Tipos principais da função de replicação
// --------------------------------------------------------------

export interface ReplicateOptions<T extends BaseDocument> {
  collection: RxCollection<T>;
  tableName: string;
  batchSize?: number;
  supabaseUrl: string;
  supabaseKey: string;
  transformPull?: (doc: any) => T;
  transformPush?: (doc: T) => any;
}

// --------------------------------------------------------------
// 🟩 Função genérica que habilita replicação para qualquer collection
// --------------------------------------------------------------

export function replicateCollection<T extends BaseDocument>({
  collection,
  tableName,
  batchSize = 1000,
  supabaseUrl,
  supabaseKey,
  transformPull,
  transformPush,
}: ReplicateOptions<T>): ReturnType<typeof replicateRxCollection<T, unknown>> {
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}`;

  // ------------------------------------------------------------
  // 🔹 PULL — buscar alterações novas do Supabase
  // ------------------------------------------------------------
  const pullHandler: ReplicationPullOptions<T, unknown>["handler"] = async (
    checkpoint,
    batchSize
  ) => {
    const lastUpdated =
      (checkpoint as { _modified?: string })?._modified ??
      "1970-01-01T00:00:00.000Z";

    try {
      // Assume server uses updatedAt for sorting/filtering
      const url = `${endpoint}?select=*&order=updatedAt.asc&limit=${batchSize}&updatedAt=gt.${lastUpdated}`;
      console.log(`Fetching from Supabase: ${url}`);
      const response = await fetch(url, {
        headers: {
          apiKey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Supabase fetch failed: ${response.status} ${response.statusText}`,
          errorText
        );
        throw new Error(
          `Failed to fetch from Supabase: ${response.status} ${errorText}`
        );
      }

      const data: any[] = await response.json();
      const docs = Array.isArray(data) ? data : [];

      console.log(`📥 Pulled ${docs.length} documents from ${tableName}`);

      // Ensure _deleted is boolean and apply transformation if needed
      const processedDocs = docs.map((doc) => {
        // Map server updatedAt to _modified if needed
        const modified =
          doc._modified || doc.updatedAt || new Date().toISOString();

        const processed = {
          ...doc,
          _deleted: !!doc._deleted,
          _modified: modified,
        };

        // Remove updatedAt if it exists to avoid schema errors
        if ("updatedAt" in processed) {
          delete processed.updatedAt;
        }

        const transformed = transformPull
          ? transformPull(processed)
          : processed;

        // Validar campos obrigatórios (uuid e _modified)
        if (!transformed.uuid) {
          console.error(`❌ Documento sem uuid:`, transformed);
          throw new Error(`Document missing required field: uuid`);
        }

        if (!transformed._modified) {
          console.warn(
            `⚠️ Documento sem _modified, usando timestamp atual:`,
            transformed.uuid
          );
          transformed._modified = new Date().toISOString();
        }

        return transformed as WithDeleted<T>;
      });

      return {
        documents: processedDocs,
        checkpoint: {
          _modified:
            processedDocs.length > 0
              ? processedDocs[processedDocs.length - 1]._modified
              : lastUpdated,
        },
      };
    } catch (error) {
      console.error(`❌ Pull error for ${tableName}:`, error);
      throw error;
    }
  };

  // ------------------------------------------------------------
  // 🔹 PUSH — enviar alterações locais para o Supabase
  // ------------------------------------------------------------
  const pushHandler: ReplicationPushOptions<T>["handler"] = async (rows) => {
    const updates = rows.map((r: PushRow<T>) => r.newDocumentState);

    try {
      console.log(`Pushing to Supabase: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        // If offline or server error, RxDB handles retry automatically
        throw new Error(`Push failed: ${response.status}`);
      }

      return []; // Success
    } catch (error) {
      console.error("Push error:", error);
      throw error;
    }
  };

  // ------------------------------------------------------------
  // 🔹 Inicializar replicação contínua
  // ------------------------------------------------------------
  const replicationState = replicateRxCollection({
    collection,
    replicationIdentifier: `sync-${tableName}`,
    pull: {
      handler: pullHandler,
      batchSize,
    },
    push: {
      handler: pushHandler,
      batchSize,
    },
    live: true,
    retryTime: 5000,
    autoStart: true,
  });

  return replicationState;
}
