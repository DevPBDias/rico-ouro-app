"use client";

import { createRxDatabase, addRxPlugin, removeRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
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

// Add plugins
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

if (process.env.NODE_ENV === "development") {
  addRxPlugin(RxDBDevModePlugin);
}

let dbPromise: Promise<MyDatabase | null> | null = null;

const DB_NAME = "indi_ouro_db_v6";

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
    console.warn("IndexedDB not available. Skipping RxDB initialization.");
    return null;
  }

  console.log("🚀 Initializing RxDB...");

  // Use validated storage in development mode
  const storage =
    process.env.NODE_ENV === "production"
      ? getRxStorageDexie()
      : wrappedValidateAjvStorage({ storage: getRxStorageDexie() });

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

    if (
      (await db) &&
      navigator.onLine &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
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
      console.warn("Replication not started: offline or missing env");
    }

    console.log("✅ RxDB initialized!");
    return db;
  } catch (error) {
    // Handle schema conflicts (DB9 or DXE1 errors)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code || "";

    console.error("Database initialization error:", error);

    if (
      errorMessage.includes("DB9") ||
      errorMessage.includes("DXE1") ||
      errorCode === "DB9" ||
      errorCode === "DXE1"
    ) {
      console.warn("⚠️ Schema conflict detected.");

      if (
        process.env.NODE_ENV === "development" ||
        process.env.NEXT_PUBLIC_FORCE_RESET_DB === "true"
      ) {
        console.warn("Removing old databases and retrying...");
        // Try to remove all possible old database versions AND the current one if it's conflicting
        const oldDbNames = [
          DB_NAME, // Adiciona o banco atual para garantir limpeza em caso de conflito
          "indi_ouro_db",
          "indi_ouro_db_v2",
          "indi_ouro_db_v3",
          "indi_ouro_db_v4",
          "indi_ouro_db_v5",
          "rico_ouro_db",
          "rico_ouro_db_v2",
          "rico_ouro_db_v3",
          "rico_ouro_db_v4",
        ];
        for (const dbName of oldDbNames) {
          try {
            await removeRxDatabase(dbName, storage);
            console.log(`🗑️ Removed old database: ${dbName}`);
          } catch (removeError) {
            // Ignore errors when removing databases that don't exist
          }
        }

        // Retry database creation
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

        if (
          (await db) &&
          navigator.onLine &&
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
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
        }

        console.log("✅ RxDB initialized after cleanup!");
        return db;
      } else {
        console.error(
          "DB9 error in production. Manual intervention might be required or set NEXT_PUBLIC_FORCE_RESET_DB=true."
        );
      }
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
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};
