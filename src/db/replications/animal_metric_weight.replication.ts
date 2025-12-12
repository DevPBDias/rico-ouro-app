import { MyDatabase } from "../collections";
import { replicateRxCollection } from "rxdb/plugins/replication";
import {
  getAuthHeaders,
  cleanSupabaseDocuments,
} from "@/lib/supabase/auth-helper";

export async function replicateAnimalMetricWeight(
  db: MyDatabase,
  supabaseUrl: string,
  supabaseKey: string
) {
  const collection = db.animal_metrics_weight;
  const replicationIdentifier = "animal-metrics-weight-replication";

  const replication = replicateRxCollection({
    collection,
    replicationIdentifier,
    pull: {
      async handler(checkpoint, batchSize) {
        const lastModified =
          (checkpoint as any)?.updated_at || "1970-01-01T00:00:00Z";

        const headers = await getAuthHeaders();

        const encodedDate = encodeURIComponent(lastModified);
        const response = await fetch(
          `${supabaseUrl}/rest/v1/animal_metrics_weight?select=*&order=updated_at.asc&limit=${batchSize}&updated_at=gt.${encodedDate}`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Pull failed: ${response.status}`);
        }

        const data = await response.json();
        const documents = Array.isArray(data) ? data : [];

        const newCheckpoint = {
          updated_at:
            documents.length > 0
              ? documents[documents.length - 1].updated_at
              : lastModified,
        };

        return {
          documents: documents,
          checkpoint: newCheckpoint,
        };
      },
      batchSize: 100,
    },
    push: {
      async handler(rows) {
        const documents = rows.map((row) => row.newDocumentState);

        const headers = await getAuthHeaders();

        const response = await fetch(
          `${supabaseUrl}/rest/v1/animal_metrics_weight`,
          {
            method: "POST",
            headers: {
              ...headers,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          }
        );

        if (!response.ok) {
          throw new Error(`Push failed: ${response.status}`);
        }

        return [];
      },
      batchSize: 100,
    },
    live: true,
    retryTime: 5000,
    autoStart: true,
  });

  return replication;
}
