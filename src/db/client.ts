"use client";

import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { animalSchema } from "./schemas/animal.schema";
import { vaccineSchema } from "./schemas/vaccine.schema";
import { farmSchema } from "./schemas/farm.schema";
import { matrizSchema } from "./schemas/matriz.schema";
import { MyDatabase, MyDatabaseCollections } from "./collections";
import { replicateAnimals } from "./replicators/animal.replication";
import { replicateVaccines } from "./replicators/vaccine.replication";
import { replicateFarms } from "./replicators/farm.replication";
import { replicateMatriz } from "./replicators/matriz.replication";
import { resetIndexedDB } from "./utils/reset-indexeddb";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { startRxDBDebugLogs } from "./utils/debug";

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

// Always add DevMode for debugging
addRxPlugin(RxDBDevModePlugin);

let dbPromise: Promise<MyDatabase | null> | null = null;

// CRITICAL: Increment this version whenever schemas change
const DB_NAME = "indi_ouro_db_v13";

startRxDBDebugLogs(DB_NAME);
/**
 * Cria e retorna a instância do banco de dados RxDB
 * IMPORTANTE: Esta função só deve ser chamada no cliente (browser)
 */
const createDatabase = async (): Promise<MyDatabase | null> => {
  // Verificação de segurança: só executar no cliente
  if (typeof window === "undefined") {
    throw new Error(
      "RxDB cannot be initialized on the server. This function should only run in the browser."
    );
  }

  if (!("indexedDB" in window)) {
    console.warn("⚠️ IndexedDB not available. Skipping RxDB initialization.");
    return null;
  }

  console.log("🚀 Initializing RxDB...");

  // CRITICAL: ALWAYS use getRxStorageDexie() directly
  // NEVER use wrappedValidateAjvStorage in production - it causes DB9 errors
  const storage = getRxStorageDexie();

  try {
    const db = await createRxDatabase<MyDatabaseCollections>({
      name: DB_NAME,
      storage,
      multiInstance: true,
      eventReduce: true,
      ignoreDuplicate: true,
    });

    console.log("📦 Adding collections...");

    await db.addCollections({
      animals: { schema: animalSchema },
      vaccines: { schema: vaccineSchema },
      farms: { schema: farmSchema },
      matriz: { schema: matrizSchema },
    });

    console.log("✅ Collections created successfully");

    // Verificar se as collections foram criadas corretamente
    if (!db.animals || !db.vaccines || !db.farms || !db.matriz) {
      throw new Error("Collections were not created properly");
    }

    // Check if Supabase is configured via the singleton client
    const supabase = getBrowserSupabase();
    if (supabase && navigator.onLine) {
      console.log("🔄 Starting replication...");
      const [animals, vaccines, farms, matriz] = await Promise.all([
        replicateAnimals(db.animals),
        replicateVaccines(db.vaccines),
        replicateFarms(db.farms),
        replicateMatriz(db.matriz),
      ]);

      (db as any).replications = {
        animals,
        vaccines,
        farms,
        matriz,
      };
    } else {
      console.warn(
        "⚠️ Replication not started: offline or missing Supabase config"
      );
    }

    console.log("✅ RxDB initialized successfully!");
    return db;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code || "";

    console.error("❌ Database initialization error:", error);
    console.groupCollapsed("🔥 RxDB INIT FAILURE");
    console.error("Full Error Object:", error);
    console.error("Error Code:", (error as any)?.code);
    console.error("Error Message:", (error as any)?.message);
    console.trace();
    console.groupEnd();

    // Handle schema conflicts (DB9 or DXE1 errors)
    if (
      errorMessage.includes("DB9") ||
      errorMessage.includes("DXE1") ||
      errorCode === "DB9" ||
      errorCode === "DXE1"
    ) {
      console.warn("⚠️ Schema conflict detected (DB9). Resetting database...");

      // List of all possible old database versions to clean up
      const oldDbNames = [
        "indi_ouro_db",
        "indi_ouro_db_v2",
        "indi_ouro_db_v3",
        "indi_ouro_db_v4",
        "indi_ouro_db_v5",
        "indi_ouro_db_v6",
        "indi_ouro_db_v7",
        "indi_ouro_db_v8",
        "indi_ouro_db_v9",
        "indi_ouro_db_v10",
        "indi_ouro_db_v11",
        "indi_ouro_db_v12", // Include current version for cleanup
        "rico_ouro_db",
        "rico_ouro_db_v2",
        "rico_ouro_db_v3",
        "rico_ouro_db_v4",
      ];

      console.log("🗑️ Removing old databases with robust cleanup...");

      // Use the robust resetIndexedDB utility for each database
      for (const dbName of oldDbNames) {
        try {
          const result = await resetIndexedDB({
            dbName,
            clearLocalStorage: true,
            clearSessionStorage: true,
            invalidateSWCache: true,
            timeout: 5000,
          });

          if (result.success) {
            console.log(`   ✓ Removed: ${dbName}`);
          } else {
            console.warn(
              `   ⚠️ Partial cleanup: ${dbName} - ${result.message}`
            );
          }
        } catch (removeError) {
          // Silently ignore errors for databases that don't exist
          console.debug(`   - Skipped: ${dbName} (doesn't exist)`);
        }
      }

      // CRITICAL: Wait for IndexedDB to fully release locks
      console.log("⏳ Waiting for IndexedDB cleanup (3s)...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Retry database creation with clean state
      console.log("🔄 Retrying database creation...");
      const db = await createRxDatabase<MyDatabaseCollections>({
        name: DB_NAME,
        storage,
        multiInstance: true,
        eventReduce: true,
        ignoreDuplicate: true,
      });

      console.log("📦 Adding collections after cleanup...");
      await db.addCollections({
        animals: { schema: animalSchema },
        vaccines: { schema: vaccineSchema },
        farms: { schema: farmSchema },
        matriz: { schema: matrizSchema },
      });

      // Restart replication if available
      const supabase = getBrowserSupabase();
      if (supabase && navigator.onLine) {
        console.log("🔄 Starting replication after recovery...");
        const [animals, vaccines, farms, matriz] = await Promise.all([
          replicateAnimals(db.animals),
          replicateVaccines(db.vaccines),
          replicateFarms(db.farms),
          replicateMatriz(db.matriz),
        ]);

        (db as any).replications = {
          animals,
          vaccines,
          farms,
          matriz,
        };
      }

      console.log("✅ RxDB initialized successfully after recovery!");
      return db;
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Retorna a instância do banco de dados (singleton)
 * IMPORTANTE: Só usar em Client Components!
 */
export const getDatabase = async (): Promise<MyDatabase | null> => {
  if (typeof window === "undefined") {
    console.warn("⚠️ getDatabase() called on server - returning null");
    return null;
  }

  if (!dbPromise) {
    dbPromise = createDatabase();
  }

  return dbPromise;
};
