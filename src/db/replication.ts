import { MyDatabase } from "./collections";
import { replicateRxCollection } from "rxdb/plugins/replication";

/**
 * Validate and get Supabase configuration
 */
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Strict validation - no placeholders allowed
  if (!url || !key || url.includes("placeholder") || key === "placeholder") {
    return null;
  }

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes("supabase")) {
      console.error("❌ Invalid Supabase URL format:", url);
      return null;
    }
  } catch (error) {
    console.error("❌ Invalid Supabase URL:", url);
    return null;
  }

  return { url, key };
}

/**
 * Check if Supabase is accessible
 */
async function checkSupabaseHealth(url: string, key: string): Promise<boolean> {
  try {
    console.log("🏥 Checking Supabase health...");
    
    const response = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const isHealthy = response.ok || response.status === 404; // 404 is ok for root endpoint
    console.log(`🏥 Supabase health check: ${isHealthy ? "✅ OK" : "❌ FAILED"}`);
    
    return isHealthy;
  } catch (error) {
    console.error("❌ Supabase health check failed:", error);
    return false;
  }
}

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

  // Validate Supabase configuration
  const config = getSupabaseConfig();
  
  if (!config) {
    console.warn(
      "⚠️ Supabase not configured properly. Replication disabled.\n" +
      "   This is normal in development if you haven't set up Supabase yet.\n" +
      "   The app will work in offline-only mode.\n" +
      "   To enable sync, configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return;
  }

  const { url: SUPABASE_URL, key: SUPABASE_KEY } = config;

  // Health check before starting replication
  const isHealthy = await checkSupabaseHealth(SUPABASE_URL, SUPABASE_KEY);
  
  if (!isHealthy) {
    console.error(
      "❌ Supabase is not accessible. Replication disabled.\n" +
      "   The app will work in offline-only mode.\n" +
      "   Please check:\n" +
      "   1. Your internet connection\n" +
      "   2. Supabase URL is correct\n" +
      "   3. Supabase API key is valid\n" +
      "   4. Supabase project is running"
    );
    return;
  }

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
          console.log(`🔼 [Animals] PUSH triggered with ${rows.length} rows`);
          const documents = rows.map((row) => row.newDocumentState);

          console.log(`🔼 [Animals] Sending to Supabase:`, {
            count: documents.length,
            sample: documents[0]
              ? { uuid: documents[0].uuid, rgn: documents[0].animal?.rgn }
              : null,
          });

          const response = await fetch(`${SUPABASE_URL}/rest/v1/animals`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              // CRITICAL: Use merge-duplicates to enable UPSERT behavior
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
    let animalsErrorCount = 0;
    let vaccinesErrorCount = 0;
    let farmsErrorCount = 0;
    let matrizErrorCount = 0;
    const MAX_ERRORS = 3;

    animalsReplication.error$.subscribe((error) => {
      if (error) {
        animalsErrorCount++;
        console.error(`❌ [Animals] Replication error (${animalsErrorCount}/${MAX_ERRORS}):`, error);
        
        if (animalsErrorCount >= MAX_ERRORS) {
          console.error("🛑 [Animals] Too many errors, stopping replication");
          animalsReplication.cancel();
        }
      }
    });

    animalsReplication.active$.subscribe((active) => {
      console.log(`🔄 [Animals] Replication active: ${active}`);
      if (active) {
        animalsErrorCount = 0; // Reset error count on successful activity
      }
    });

    vaccinesReplication.error$.subscribe((error) => {
      if (error) {
        vaccinesErrorCount++;
        console.error(`❌ [Vaccines] Replication error (${vaccinesErrorCount}/${MAX_ERRORS}):`, error);
        
        if (vaccinesErrorCount >= MAX_ERRORS) {
          console.error("🛑 [Vaccines] Too many errors, stopping replication");
          vaccinesReplication.cancel();
        }
      }
    });

    vaccinesReplication.active$.subscribe((active) => {
      if (active) {
        vaccinesErrorCount = 0;
      }
    });

    farmsReplication.error$.subscribe((error) => {
      if (error) {
        farmsErrorCount++;
        console.error(`❌ [Farms] Replication error (${farmsErrorCount}/${MAX_ERRORS}):`, error);
        
        if (farmsErrorCount >= MAX_ERRORS) {
          console.error("🛑 [Farms] Too many errors, stopping replication");
          farmsReplication.cancel();
        }
      }
    });

    farmsReplication.active$.subscribe((active) => {
      if (active) {
        farmsErrorCount = 0;
      }
    });

    matrizReplication.error$.subscribe((error) => {
      if (error) {
        matrizErrorCount++;
        console.error(`❌ [Matriz] Replication error (${matrizErrorCount}/${MAX_ERRORS}):`, error);
        
        if (matrizErrorCount >= MAX_ERRORS) {
          console.error("🛑 [Matriz] Too many errors, stopping replication");
          matrizReplication.cancel();
        }
      }
    });

    matrizReplication.active$.subscribe((active) => {
      if (active) {
        matrizErrorCount = 0;
      }
    });
  } catch (error) {
    console.error("❌ Replication setup error:", error);
    // Don't throw - allow app to continue in offline mode
    console.warn("⚠️ App will continue in offline-only mode");
  }
}
