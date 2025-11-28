"use client";

import { createRxDatabase, addRxPlugin, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
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
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBMigrationPlugin);

if (process.env.NODE_ENV === "development") {
  import("rxdb/plugins/dev-mode").then((module) => {
    addRxPlugin(module.RxDBDevModePlugin);
    console.log("🔧 RxDB DevMode ativado");
  });
}

const DB_NAME = "indi_ouro_db";

const globalForRxDB = globalThis as unknown as {
  rxdbPromise: Promise<MyDatabase> | null;
};

startRxDBDebugLogs(DB_NAME);

const COLLECTION_SCHEMAS = {
  animals: animalSchema,
  vaccines: vaccineSchema,
  farms: farmSchema,
  matriz: matrizSchema,
} as const;

async function addCollectionsSafe(db: RxDatabase<MyDatabaseCollections>) {
  console.log("📦 Adding collections...");

  await db.addCollections(
    Object.fromEntries(
      Object.entries(COLLECTION_SCHEMAS).map(([key, schema]) => [
        key,
        {
          schema,
          migrationStrategies: {
            1: (doc: any) => doc,
          },
        },
      ])
    ) as any
  );

  if (!db.animals || !db.vaccines || !db.farms || !db.matriz) {
    throw new Error("Collections failed to initialize");
  }
}

async function startReplications(db: MyDatabase) {
  const supabase = getBrowserSupabase();
  if (!supabase || !navigator.onLine) {
    console.warn("⚠️ Replication skipped (offline or no Supabase)");
    return;
  }

  console.log("🔄 Starting replications...");

  try {
    const [animals, vaccines, farms, matriz] = await Promise.all([
      replicateAnimals(db.animals),
      replicateVaccines(db.vaccines),
      replicateFarms(db.farms),
      replicateMatriz(db.matriz),
    ]);

    (db as any).replications = { animals, vaccines, farms, matriz };
  } catch (error) {
    console.error("❌ Error starting replications:", error);
  }
}

async function createRxDB(): Promise<MyDatabase> {
  console.log("🚀 Initializing RxDB...");
  const storage = getRxStorageDexie();

  const db = await createRxDatabase<MyDatabaseCollections>({
    name: DB_NAME,
    storage,
    multiInstance: true,
    eventReduce: true,
    ignoreDuplicate: true,
  });

  await addCollectionsSafe(db);

  startReplications(db).catch(console.error);

  console.log("✅ RxDB initialized successfully");
  return db;
}

export async function getDatabase(): Promise<MyDatabase | null> {
  if (typeof window === "undefined") return null;

  if (globalForRxDB.rxdbPromise) {
    return globalForRxDB.rxdbPromise;
  }
  globalForRxDB.rxdbPromise = (async () => {
    try {
      return await createRxDB();
    } catch (err: any) {
      console.error("❌ RxDB Init Error:", err);

      // Tratamento específico para conflito de schema (DB9)
      if (
        err?.message?.includes("DB9") ||
        err?.code === "DB9" ||
        err?.message?.includes("Schema conflict")
      ) {
        console.warn("⚠️ Schema conflict detected. Resetting database...");

        globalForRxDB.rxdbPromise = null;

        // Reseta o banco
        await resetIndexedDB({
          dbName: DB_NAME,
          clearLocalStorage: true,
          clearSessionStorage: true,
          invalidateSWCache: true,
        });

        if (typeof window !== "undefined") {
          console.log("🔄 Reloading page to apply clean state...");
          window.location.reload();
          return new Promise(() => {}) as Promise<MyDatabase>;
        }
      }

      throw err;
    }
  })();

  return globalForRxDB.rxdbPromise;
}
