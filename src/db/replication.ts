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

  // Initial health check (non-blocking)
  checkSupabaseHealth(SUPABASE_URL, SUPABASE_KEY).then((isHealthy) => {
    if (!isHealthy) {
      console.warn(
        "⚠️ Supabase unreachable initially. Replication will retry automatically when online."
      );
    }
  });

  try {
    // Replicate animals
    const animalsCount = await db.animals.count().exec();
    console.log(`📊 [Animals] Local count before sync: ${animalsCount}`);

    const animalsReplication = replicateRxCollection({
      collection: db.animals,
      replicationIdentifier: "animals-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          console.log(`🔽 [Animals] Pulling from Supabase (animals)...`, {
            lastModified,
            batchSize,
            localCount: await db.animals.count().exec(),
          });

          // Se não tiver checkpoint (primeira vez) ou coleção vazia, garantir pull completo
          const isFirstSync = lastModified === "1970-01-01T00:00:00Z";

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/animals?select=*&order=%22updatedAt%22.asc&limit=${batchSize}&%22updatedAt%22=gt.${lastModified}`,
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

          // Transform Supabase format to RxDB format
          // Supabase já usa campos JSONB (animal, pai, mae, avoMaterno)
          const transformed = documents.map((doc) => ({
            uuid: doc.uuid,
            id: doc.id,
            animal: doc.animal || {},
            pai: doc.pai || {},
            mae: doc.mae || {},
            avoMaterno: doc.avoMaterno || {},
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

          // Supabase usa os mesmos nomes de campos que RxDB
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
            `${SUPABASE_URL}/rest/v1/vaccines?select=*&order=%22updatedAt%22.asc&limit=${batchSize}&%22updatedAt%22=gt.${lastModified}`,
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
            `${SUPABASE_URL}/rest/v1/farms?select=*&order=%22updatedAt%22.asc&limit=${batchSize}&%22updatedAt%22=gt.${lastModified}`,
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
    const matrizCount = await db.matriz.count().exec();
    console.log(`📊 [Matriz] Local count before sync: ${matrizCount}`);

    const matrizReplication = replicateRxCollection({
      collection: db.matriz,
      replicationIdentifier: "matriz-replication",
      pull: {
        async handler(checkpoint, batchSize) {
          const lastModified =
            (checkpoint as any)?.updatedAt || "1970-01-01T00:00:00Z";

          console.log(`🔽 [Matriz] Pulling from Supabase (matriz)...`, {
            lastModified,
            batchSize,
            localCount: await db.matriz.count().exec(),
          });

          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/matriz?select=*&order=%22updatedAt%22.asc&limit=${batchSize}&%22updatedAt%22=gt.${lastModified}`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
              },
            }
          );

          if (!response.ok) {
            console.error(`❌ [Matriz] Pull failed: ${response.status}`);
            throw new Error(`Pull failed: ${response.status}`);
          }

          const data = await response.json();
          const documents = Array.isArray(data) ? data : [];

          console.log(`✅ [Matriz] Received ${documents.length} documents`);

          // Supabase usa estrutura flat (campos diretos)
          // Não precisa transformação, já está no formato correto
          const transformed = documents.map((doc) => ({
            ...doc,
            vacinas: doc.vacinas || [], // Garante que vacinas seja sempre um array
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
          console.log(`🔼 [Matriz] PUSH triggered with ${rows.length} rows`);
          const documents = rows.map((row) => row.newDocumentState);

          console.log(`🔼 [Matriz] Sending to Supabase:`, {
            count: documents.length,
            sample: documents[0]
              ? { uuid: documents[0].uuid, nome: documents[0].nome }
              : null,
          });

          // Supabase usa estrutura flat (mesmos campos que RxDB)
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
            const errorText = await response.text();
            console.error(`❌ [Matriz] Push failed:`, {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
            });
            throw new Error(`Push failed: ${response.status} - ${errorText}`);
          }

          console.log(
            `✅ [Matriz] Successfully pushed ${documents.length} documents`
          );

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

    // Setup auto-reconnect listeners
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 Online detected - forcing replication retry");
        animalsReplication.reSync();
        vaccinesReplication.reSync();
        farmsReplication.reSync();
        matrizReplication.reSync();
      });
    }

    // Subscribe to replication events for debugging
    let animalsErrorCount = 0;
    const MAX_ERRORS = 5; // Increased tolerance

    animalsReplication.error$.subscribe((error) => {
      if (error) {
        animalsErrorCount++;
        console.error(
          `❌ [Animals] Replication error (${animalsErrorCount}/${MAX_ERRORS}):`,
          error
        );

        // Only stop if errors persist excessively
        if (animalsErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Animals] High error rate, but keeping replication alive for retry."
          );
          // animalsReplication.cancel(); // Don't cancel, let it retry
        }
      }
    });

    animalsReplication.active$.subscribe((active) => {
      console.log(`🔄 [Animals] Replication active: ${active}`);
      if (active) {
        animalsErrorCount = 0; // Reset error count on successful activity
      }
    });

    // Vaccines error handling
    let vaccinesErrorCount = 0;
    vaccinesReplication.error$.subscribe((error) => {
      if (error) {
        vaccinesErrorCount++;
        console.error(
          `❌ [Vaccines] Replication error (${vaccinesErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (vaccinesErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Vaccines] High error rate, but keeping replication alive for retry."
          );
        }
      }
    });

    vaccinesReplication.active$.subscribe((active) => {
      if (active) {
        vaccinesErrorCount = 0;
      }
    });

    // Farms error handling
    let farmsErrorCount = 0;
    farmsReplication.error$.subscribe((error) => {
      if (error) {
        farmsErrorCount++;
        console.error(
          `❌ [Farms] Replication error (${farmsErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (farmsErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Farms] High error rate, but keeping replication alive for retry."
          );
        }
      }
    });

    farmsReplication.active$.subscribe((active) => {
      if (active) {
        farmsErrorCount = 0;
      }
    });

    // Matriz error handling
    let matrizErrorCount = 0;
    matrizReplication.error$.subscribe((error) => {
      if (error) {
        matrizErrorCount++;
        console.error(
          `❌ [Matriz] Replication error (${matrizErrorCount}/${MAX_ERRORS}):`,
          error
        );

        if (matrizErrorCount >= MAX_ERRORS) {
          console.warn(
            "⚠️ [Matriz] High error rate, but keeping replication alive for retry."
          );
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
    console.warn("⚠️ App will continue in offline-only mode");
  }
}
