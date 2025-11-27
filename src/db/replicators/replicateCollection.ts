import {
  RxCollection,
  ReplicationPullOptions,
  ReplicationPushOptions,
} from "rxdb";
import { replicateRxCollection } from "rxdb/plugins/replication";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

// --------------------------------------------------------------
// 🟦 Tipos genéricos utilizados para replicação
// --------------------------------------------------------------

export interface BaseDocument {
  uuid?: string;
  updatedAt?: string;
  _deleted?: boolean;
}

export interface PullResult<T> {
  documents: T[];
  checkpoint: { updatedAt: string | null };
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
}

// --------------------------------------------------------------
// 🟩 Função genérica que habilita replicação para qualquer collection
// --------------------------------------------------------------

export function replicateCollection<T extends BaseDocument>({
  collection,
  tableName,
  batchSize = 50,
  supabaseUrl,
  supabaseKey,
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
      (checkpoint as { updatedAt?: string })?.updatedAt ??
      "1970-01-01T00:00:00.000Z";

    try {
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

      const data: T[] = await response.json();
      const docs = Array.isArray(data) ? data : [];

      // Ensure _deleted is boolean
      const processedDocs = docs.map((doc) => ({
        ...doc,
        _deleted: !!doc._deleted,
      }));

      return {
        documents: processedDocs,
        checkpoint: {
          updatedAt:
            processedDocs.length > 0
              ? processedDocs[processedDocs.length - 1].updatedAt
              : lastUpdated,
        },
      };
    } catch (error) {
      console.error("Pull error:", error);
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
