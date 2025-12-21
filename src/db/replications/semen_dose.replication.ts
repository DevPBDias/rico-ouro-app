import { MyDatabase } from "../collections";
import { replicateRxCollection } from "rxdb/plugins/replication";
import {
  getAuthHeaders,
  cleanSupabaseDocuments,
} from "@/lib/supabase/auth-helper";

export async function replicateSemenDoses(
  db: MyDatabase,
  supabaseUrl: string,
  supabaseKey: string
) {
  const collection = db.semen_doses;
  const replicationIdentifier = "semen-doses-replication-v4";

  const replication = replicateRxCollection({
    collection,
    replicationIdentifier,
    pull: {
      async handler(checkpoint, batchSize) {
        const lastModified =
          (checkpoint as any)?.updated_at || "1970-01-01T00:00:00Z";

        console.log(`🔽 [SemenDoses] Pulling from Supabase...`, {
          lastModified,
          batchSize,
          localCount: await collection.count().exec(),
        });

        const headers = await getAuthHeaders();

        if (!headers.Authorization) {
          console.warn(
            "⚠️ [SemenDoses] No auth token available. Skipping pull to prevent checkpoint contamination."
          );
          throw new Error("Authentication required for sync");
        }

        const encodedDate = encodeURIComponent(lastModified);
        const response = await fetch(
          `${supabaseUrl}/rest/v1/semen_doses?select=*&order=updated_at.asc&limit=${batchSize}&updated_at=gt.${encodedDate}`,
          { headers }
        );

        if (!response.ok) {
          console.error(`❌ [SemenDoses] Pull failed: ${response.status}`);
          throw new Error(`Pull failed: ${response.status}`);
        }

        const data = await response.json();
        const rawDocuments = Array.isArray(data) ? data : [];

        const documents = cleanSupabaseDocuments(rawDocuments);

        console.log(`✅ [SemenDoses] Received ${documents.length} documents`);

        const newCheckpoint = {
          updated_at:
            rawDocuments.length > 0
              ? rawDocuments[rawDocuments.length - 1].updated_at
              : lastModified,
        };

        return {
          documents: documents,
          checkpoint: newCheckpoint,
        };
      },
      batchSize: 1000,
    },
    push: {
      async handler(rows) {
        console.log(`🔼 [SemenDoses] PUSH triggered with ${rows.length} rows`);

        const documents = rows.map((row) => {
          const doc = row.newDocumentState as any;
          return {
            id: doc.id,
            animal_name: doc.animal_name,
            animal_image: doc.animal_image,
            father_name: doc.father_name,
            maternal_grandfather_name: doc.maternal_grandfather_name,
            iabcz: doc.iabcz,
            registration: doc.registration,
            center_name: doc.center_name,
            breed: doc.breed,
            quantity: doc.quantity,
            updated_at: doc.updated_at,
            _deleted: doc._deleted,
          };
        });

        console.log(`🔼 [SemenDoses] Sending to Supabase:`, {
          count: documents.length,
          sample: documents[0],
        });

        const headers = await getAuthHeaders();

        const response = await fetch(`${supabaseUrl}/rest/v1/semen_doses`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify(documents),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [SemenDoses] Push failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Push failed: ${response.status} - ${errorText}`);
        }

        console.log(
          `✅ [SemenDoses] Successfully pushed ${documents.length} documents`
        );

        return [];
      },
      batchSize: 1000,
    },
    live: true,
    retryTime: 5000,
    autoStart: true,
  });

  return replication;
}
