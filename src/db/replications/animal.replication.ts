import { MyDatabase } from "../collections";
import { replicateRxCollection } from "rxdb/plugins/replication";
import {
  getAuthHeaders,
  cleanSupabaseDocuments,
} from "@/lib/supabase/auth-helper";

export async function replicateAnimals(
  db: MyDatabase,
  supabaseUrl: string,
  supabaseKey: string
) {
  const collection = db.animals;
  const replicationIdentifier = "animals-replication";

  const replication = replicateRxCollection({
    collection,
    replicationIdentifier,
    pull: {
      async handler(checkpoint, batchSize) {
        const lastModified =
          (checkpoint as any)?.updated_at || "1970-01-01T00:00:00Z";

        console.log(`🔽 [Animals] Pulling from Supabase (animals)...`, {
          lastModified,
          batchSize,
          localCount: await collection.count().exec(),
        });

        const headers = await getAuthHeaders();

        const response = await fetch(
          `${supabaseUrl}/rest/v1/animals?select=*&order=updated_at.asc&limit=${batchSize}&updated_at=gt.${lastModified}`,
          { headers }
        );

        if (!response.ok) {
          console.error(`❌ [Animals] Pull failed: ${response.status}`);
          throw new Error(`Pull failed: ${response.status}`);
        }

        const data = await response.json();
        const rawDocuments = Array.isArray(data) ? data : [];

        // Clean null values from Supabase documents
        const documents = cleanSupabaseDocuments(rawDocuments);

        console.log(`✅ [Animals] Received ${documents.length} documents`);

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
        console.log(`🔼 [Animals] PUSH triggered with ${rows.length} rows`);
        // Normalize all documents to have the same keys for Supabase bulk insert
        const documents = rows.map((row) => {
          const doc = row.newDocumentState as any;
          return {
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
            updated_at: doc.updated_at,
            _deleted: doc._deleted ?? false,
          };
        });

        console.log(`🔼 [Animals] Sending to Supabase:`, {
          count: documents.length,
          sampleKeys: documents[0] ? Object.keys(documents[0]) : [],
          sample: documents[0],
        });

        const headers = await getAuthHeaders();

        const response = await fetch(`${supabaseUrl}/rest/v1/animals`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify(documents),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [Animals] Push failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Push failed: ${response.status} - ${errorText}`);
        }

        console.log(
          `✅ [Animals] Successfully pushed ${documents.length} documents`
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
