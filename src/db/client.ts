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

const DB_NAME = "indi_ouro_db_v7";

const createDatabase = async (): Promise<MyDatabase | null> => {
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
    console.error("Database initialization error:", error);
    throw error;
  }
};

export const getDatabase = async (): Promise<MyDatabase | null> => {
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};
