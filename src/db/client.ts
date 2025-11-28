"use client";

import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection } from "rxdb";
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

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

const DB_NAME = "indi_ouro_db_v14";
let dbPromise: Promise<MyDatabase | null> | null = null;

startRxDBDebugLogs(DB_NAME);

const COLLECTION_SCHEMAS = {
  animals: animalSchema,
  vaccines: vaccineSchema,
  farms: farmSchema,
  matriz: matrizSchema,
} as const;

const OLD_DATABASES = Array.from({ length: 15 }).flatMap((_, i) => [
  `indi_ouro_db${i === 0 ? "" : `_v${i}`}`,
  `rico_ouro_db${i === 0 ? "" : `_v${i}`}`,
]);

async function cleanupOldDatabases() {
  console.log("🗑️ Cleaning old IndexedDB databases...");

  for (const name of OLD_DATABASES) {
    try {
      await resetIndexedDB({
        dbName: name,
        clearLocalStorage: true,
        clearSessionStorage: true,
        invalidateSWCache: true,
        timeout: 4000,
      });
    } catch {}
  }

  await new Promise((r) => setTimeout(r, 2000));
}

async function addCollectionsSafe(db: RxDatabase<MyDatabaseCollections>) {
  console.log("📦 Adding collections...");

  await db.addCollections(
    Object.fromEntries(
      Object.entries(COLLECTION_SCHEMAS).map(([key, schema]) => [
        key,
        { schema },
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

  const [animals, vaccines, farms, matriz] = await Promise.all([
    replicateAnimals(db.animals),
    replicateVaccines(db.vaccines),
    replicateFarms(db.farms),
    replicateMatriz(db.matriz),
  ]);

  (db as any).replications = { animals, vaccines, farms, matriz };
}

async function performDatabaseCreation(): Promise<MyDatabase | null> {
  const storage = getRxStorageDexie();

  const db = await createRxDatabase<MyDatabaseCollections>({
    name: DB_NAME,
    storage,
    multiInstance: true,
    eventReduce: true,
    ignoreDuplicate: true,
  });

  await addCollectionsSafe(db);
  await startReplications(db);

  console.log("✅ RxDB initialized");
  return db;
}

async function createDatabase(): Promise<MyDatabase | null> {
  if (typeof window === "undefined") return null;
  if (!("indexedDB" in window)) return null;

  try {
    return await performDatabaseCreation();
  } catch (err: any) {
    const msg = err?.message || "";
    const code = err?.code || "";

    console.error("❌ RxDB init error:", err);

    if (msg.includes("DB9") || msg.includes("DXE1") || code === "DB9") {
      console.warn("⚠️ Schema conflict detected. Resetting and retrying...");
      await cleanupOldDatabases();
      return await performDatabaseCreation();
    }

    throw err;
  }
}

export async function getDatabase(): Promise<MyDatabase | null> {
  if (typeof window === "undefined") return null;
  if (!dbPromise) dbPromise = createDatabase();
  return dbPromise;
}
