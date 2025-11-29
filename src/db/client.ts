"use client";

import {
  createRxDatabase,
  addRxPlugin,
  removeRxDatabase,
  RxStorage,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { animalSchema } from "./schemas/animal.schema";
import { vaccineSchema } from "./schemas/vaccine.schema";
import { farmSchema } from "./schemas/farm.schema";
import { matrizSchema } from "./schemas/matriz.schema";
import { MyDatabase, MyDatabaseCollections } from "./collections";
import { setupReplication } from "./replication";

// Add plugins
if (process.env.NODE_ENV === "development") {
  addRxPlugin(RxDBDevModePlugin);
} // Always enable for now to debug DB9
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBMigrationPlugin);

const DB_NAME = "indi_ouro_db_v5"; // Increment version again
const STORAGE_KEY_RESET_COUNT = "rxdb_reset_count";
const MAX_RESETS = 3;

// Global singleton
let dbInstance: MyDatabase | null = null;
let dbPromise: Promise<MyDatabase> | null = null;

import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

// ... imports ...

/**
 * Create the RxDB database with all collections
 */
async function createDatabase(): Promise<MyDatabase> {
  console.log(`📦 Creating RxDB database (${DB_NAME})...`);

  let storage: RxStorage<any, any> = getRxStorageDexie();

  // Wrap storage with validator in development to fix DVM1
  if (process.env.NODE_ENV === "development") {
    storage = wrappedValidateAjvStorage({
      storage: storage,
    });
  }

  try {
    const db = await createRxDatabase<MyDatabaseCollections>({
      name: DB_NAME,
      storage: storage as any,
      multiInstance: true,
      eventReduce: true,
      ignoreDuplicate: true,
    });

    console.log("📚 Adding collections...");

    await db.addCollections({
      animals: {
        schema: animalSchema,
        migrationStrategies: {
          1: (doc: any) => doc,
          2: (doc: any) => {
            if (doc._modified) {
              delete doc._modified;
            }
            return doc;
          },
        },
      },
      vaccines: {
        schema: vaccineSchema,
        migrationStrategies: {
          1: (doc: any) => doc,
        },
      },
      farms: {
        schema: farmSchema,
        migrationStrategies: {
          1: (doc: any) => doc,
        },
      },
      matriz: {
        schema: matrizSchema,
        migrationStrategies: {
          1: (doc: any) => doc,
        },
      },
    });

    console.log("✅ Collections created");

    // Setup replication (non-blocking)
    setupReplication(db).catch((err: Error) => {
      console.error("⚠️ Replication setup failed:", err);
    });

    // Reset reset count on success
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY_RESET_COUNT);
    }

    return db;
  } catch (err) {
    console.error("❌ Error creating database:", err);
    throw err;
  }
}

/**
 * Handle database errors and potential resets
 */
async function handleDatabaseError(error: any) {
  console.error("❌ RxDB initialization failed:", error);

  // Reset state
  dbInstance = null;
  dbPromise = null;

  // Check if it's a DB9 error or similar schema issue
  const isDB9 = error?.code === "DB9" || error?.message?.includes("DB9");

  if (isDB9 && typeof window !== "undefined") {
    const resetCount = parseInt(
      sessionStorage.getItem(STORAGE_KEY_RESET_COUNT) || "0",
      10
    );

    if (resetCount < MAX_RESETS) {
      console.warn(
        `🔄 DB9 detected. Attempting reset ${resetCount + 1}/${MAX_RESETS}...`
      );

      // Increment reset count
      sessionStorage.setItem(
        STORAGE_KEY_RESET_COUNT,
        (resetCount + 1).toString()
      );

      try {
        // Try to remove the database properly
        await removeRxDatabase(DB_NAME, getRxStorageDexie());
        console.log("✅ Database removed via removeRxDatabase");
      } catch (removeErr) {
        console.warn(
          "⚠️ removeRxDatabase failed, trying indexedDB.deleteDatabase",
          removeErr
        );
        // Fallback to raw IndexedDB delete
        try {
          indexedDB.deleteDatabase(DB_NAME);
        } catch (e) {
          console.error("❌ Failed to delete database", e);
        }
      }

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      // Return a never-resolving promise to halt execution while reloading
      return new Promise<never>(() => {});
    } else {
      console.error(
        "🛑 Max resets reached. Please clear your browser data manually."
      );
      alert(
        "Erro crítico no banco de dados. Por favor, limpe os dados do navegador e recarregue a página."
      );
    }
  }

  throw error;
}

/**
 * Get or create the RxDB database singleton
 */
export async function getDatabase(): Promise<MyDatabase> {
  // Server-side: return null
  if (typeof window === "undefined") {
    return null as any;
  }

  // Return existing instance
  if (dbInstance) {
    return dbInstance;
  }

  // Return existing promise
  if (dbPromise) {
    return dbPromise;
  }

  // Create new instance
  dbPromise = createDatabase()
    .then((db) => {
      dbInstance = db;
      console.log("✅ RxDB ready");
      return db;
    })
    .catch((error) => handleDatabaseError(error));

  return dbPromise as Promise<MyDatabase>;
}

/**
 * Check if database is ready
 */
export function isDatabaseReady(): boolean {
  return dbInstance !== null;
}
