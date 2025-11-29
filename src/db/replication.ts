import { MyDatabase } from "./collections";
import { replicateRxCollection } from "rxdb/plugins/replication";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Setup replication for all collections
 */
export async function setupReplication(db: MyDatabase) {
  // Check if online
  if (!navigator.onLine) {
    console.log("📴 Offline - skipping replication setup");
    return;
  }

  console.log("🔄 Setting up replication...");

  try {
    // Replicate animals
    const animalsReplication = replicateRxCollection({
      collection: db.animals,
      replicationIdentifier: "animals-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          console.log(`🔽 [Animals] Pulling from Supabase...`, {
            lastModified,
            batchSize,
          });

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/animals?select=*&order=updatedAt.asc&limit=${batchSize}&updatedAt=gt.${lastModified}`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );

          if (!response.ok) {
            console.error(`❌ [Animals] Pull failed: ${response.status}`);
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const documents = Array.isArray(data) ? data : [];

          console.log(`✅ [Animals] Received ${documents.length} documents`);

          // Transform documents
          const transformed = documents.map((doc) => ({
            ...doc,
            updatedAt: doc.updatedAt || new Date().toISOString(),
            _deleted: !!doc._deleted,
          }));

          const newCheckpoint = {
            updatedAt:
              transformed.length > 0
                ? transformed[transformed.length - 1].updatedAt
                : lastModified,
          };

          console.log(`📍 [Animals] New checkpoint:`, newCheckpoint);

          return {
            documents: transformed,
            checkpoint: newCheckpoint,
          };
        },
        batchSize: 1000,
      },
      push: {
        async handler(rows) {
          const documents = rows.map((row) => row.newDocumentState);

          const response = await fetch(`${SUPABASE_URL}/rest/v1/animals`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          });

          if (!response.ok) {
            throw new Error(`Push failed: ${response.status}`);
          }

          return [];
        },
        batchSize: 1000,
      },
      live: true,
      retryTime: 5000,
      autoStart: true,
    });

    // Replicate vaccines
    const vaccinesReplication = replicateRxCollection({
      collection: db.vaccines,
      replicationIdentifier: "vaccines-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/vaccines?select=*&order=updatedAt.asc&limit=${batchSize}&updatedAt=gt.${lastModified}`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const documents = Array.isArray(data) ? data : [];

          const transformed = documents.map((doc) => ({
            ...doc,
            updatedAt: doc.updatedAt || new Date().toISOString(),
            _deleted: !!doc._deleted,
          }));

          return {
            documents: transformed,
            checkpoint: {
              updatedAt:
                transformed.length > 0
                  ? transformed[transformed.length - 1].updatedAt
                  : lastModified,
            },
          };
        },
        batchSize: 100,
      },
      push: {
        async handler(rows) {
          const documents = rows.map((row) => row.newDocumentState);

          const response = await fetch(`${SUPABASE_URL}/rest/v1/vaccines`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          });

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

    // Replicate farms
    const farmsReplication = replicateRxCollection({
      collection: db.farms,
      replicationIdentifier: "farms-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/farms?select=*&order=updatedAt.asc&limit=${batchSize}&updatedAt=gt.${lastModified}`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const documents = Array.isArray(data) ? data : [];

          const transformed = documents.map((doc) => ({
            ...doc,
            updatedAt: doc.updatedAt || new Date().toISOString(),
            _deleted: !!doc._deleted,
          }));

          return {
            documents: transformed,
            checkpoint: {
              updatedAt:
                transformed.length > 0
                  ? transformed[transformed.length - 1].updatedAt
                  : lastModified,
            },
          };
        },
        batchSize: 100,
      },
      push: {
        async handler(rows) {
          const documents = rows.map((row) => row.newDocumentState);

          const response = await fetch(`${SUPABASE_URL}/rest/v1/farms`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          });

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

    // Replicate matriz
    const matrizReplication = replicateRxCollection({
      collection: db.matriz,
      replicationIdentifier: "matriz-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/matriz?select=*&order=updatedAt.asc&limit=${batchSize}&updatedAt=gt.${lastModified}`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const documents = Array.isArray(data) ? data : [];

          const transformed = documents.map((doc) => ({
            ...doc,
            updatedAt: doc.updatedAt || new Date().toISOString(),
            _deleted: !!doc._deleted,
          }));

          return {
            documents: transformed,
            checkpoint: {
              updatedAt:
                transformed.length > 0
                  ? transformed[transformed.length - 1].updatedAt
                  : lastModified,
            },
          };
        },
        batchSize: 1000,
      },
      push: {
        async handler(rows) {
          const documents = rows.map((row) => row.newDocumentState);

          const response = await fetch(`${SUPABASE_URL}/rest/v1/matriz`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify(documents),
          });

          if (!response.ok) {
            throw new Error(`Push failed: ${response.status}`);
          }

          return [];
        },
        batchSize: 1000,
      },
      live: true,
      retryTime: 5000,
      autoStart: true,
    });

    // Store replications on database instance
    (db as any).replications = {
      animals: animalsReplication,
      vaccines: vaccinesReplication,
      farms: farmsReplication,
      matriz: matrizReplication,
    };

    console.log("✅ Replication setup complete");
    console.log("📊 Replication states:", {
      animals: animalsReplication.isStopped(),
      vaccines: vaccinesReplication.isStopped(),
      farms: farmsReplication.isStopped(),
      matriz: matrizReplication.isStopped(),
    });

    // Subscribe to replication events for debugging
    animalsReplication.error$.subscribe((error) => {
      if (error) {
        console.error("❌ [Animals] Replication error:", error);
      }
    });

    animalsReplication.active$.subscribe((active) => {
      console.log(`🔄 [Animals] Replication active: ${active}`);
    });

    vaccinesReplication.error$.subscribe((error) => {
      if (error) {
        console.error("❌ [Vaccines] Replication error:", error);
      }
    });

    farmsReplication.error$.subscribe((error) => {
      if (error) {
        console.error("❌ [Farms] Replication error:", error);
      }
    });

    matrizReplication.error$.subscribe((error) => {
      if (error) {
        console.error("❌ [Matriz] Replication error:", error);
      }
    });
  } catch (error) {
    console.error("❌ Replication setup error:", error);
    throw error;
  }
}
