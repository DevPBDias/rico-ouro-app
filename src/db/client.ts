"use client";

import {
  createRxDatabase,
  addRxPlugin,
  RxStorage,
  removeRxDatabase,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { animalSchema } from "./schemas/animal.schema";
import { vaccineSchema } from "./schemas/vaccine.schema";
import { farmSchema } from "./schemas/farm.schema";
import { MyDatabase, MyDatabaseCollections } from "./collections";
import { setupReplication } from "./replication";
import { animalMetricCESchema } from "./schemas/animal_metric_ce.schema";
import { animalMetricWeightSchema } from "./schemas/animal_metric_weigth.schema";
import { animalVaccineSchema } from "./schemas/animal_vaccines.type";
import { reproductionEventSchema } from "./schemas/reproduction_event.schema";
import { animalStatusSchema } from "./schemas/animal_status.schema";
import { semenDoseSchema } from "./schemas/semen_dose.schema";

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBMigrationPlugin);

let devModeLoaded = false;

async function loadDevModePlugin(): Promise<void> {
  if (devModeLoaded || process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);
    devModeLoaded = true;
  } catch (err) {}
}

const DB_VERSION = "v6";
const DB_NAME = `indi_ouro_db_${DB_VERSION}`;

let dbInstance: MyDatabase | null = null;
let dbPromise: Promise<MyDatabase> | null = null;

async function createDatabase(): Promise<MyDatabase> {
  await loadDevModePlugin();

  let storage: RxStorage<any, any> = getRxStorageDexie();

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
    });

    try {
      await db.addCollections({
        animals: {
          schema: animalSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
          },
        },
        vaccines: {
          schema: vaccineSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        farms: {
          schema: farmSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        animal_metrics_ce: {
          schema: animalMetricCESchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        animal_metrics_weight: {
          schema: animalMetricWeightSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        animal_vaccines: {
          schema: animalVaccineSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        reproduction_events: {
          schema: reproductionEventSchema,
          migrationStrategies: {
            1: (doc: any) => doc,
            2: (doc: any) => doc,
          },
        },
        animal_statuses: {
          schema: animalStatusSchema,
        },
        semen_doses: {
          schema: semenDoseSchema,
          migrationStrategies: {
            1: (oldDoc: any) => {
              const { animalName, ...rest } = oldDoc;
              return {
                ...rest,
                animal_name: animalName || oldDoc.animal_name || "",
                animal_image: oldDoc.animal_image || "",
                father_name: oldDoc.father_name || "",
                maternal_grandfather_name:
                  oldDoc.maternal_grandfather_name || "",
                iabcz: oldDoc.iabcz || "",
                registration: oldDoc.registration || "",
                center_name: oldDoc.center_name || "",
              };
            },
          },
        },
      });
    } catch (err: any) {
      console.error("[RxDB] Failed to add collections:", err);

      if (err.message?.includes("schema") || err.name === "RxError") {
        console.warn(
          "[RxDB] Schema mismatch detected. You might need to increment collection version or DB_VERSION."
        );
      }
      throw err;
    }

    setupReplication(db).catch((err: Error) => {
      console.error("[RxDB] Replication setup failed:", err);
    });

    return db;
  } catch (err) {
    console.error("[RxDB] Error creating database:", err);
    throw err;
  }
}

export async function getDatabase(): Promise<MyDatabase> {
  if (typeof window === "undefined") {
    return null as any;
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = createDatabase()
    .then((db) => {
      dbInstance = db;
      return db;
    })
    .catch(async (error) => {
      console.error("[RxDB] Critical initialization error:", error);

      throw error;
    });

  return dbPromise as Promise<MyDatabase>;
}

export async function clearAllDatabases(): Promise<void> {
  if (typeof window === "undefined") return;

  const storage = getRxStorageDexie();

  if (dbInstance) {
    try {
      await (dbInstance as any).destroy();
      dbInstance = null;
      dbPromise = null;
    } catch (err) {
      console.error("[RxDB] Error destroying current instance:", err);
    }
  }

  try {
    if (window.indexedDB && (window.indexedDB as any).databases) {
      const dbs = await (window.indexedDB as any).databases();
      for (const dbInfo of dbs) {
        if (
          dbInfo.name &&
          (dbInfo.name.includes("indi_ouro_db") ||
            dbInfo.name.includes("rxdb-dexie-indi_ouro_db"))
        ) {
          console.log(`[RxDB] Removing legacy database: ${dbInfo.name}`);
          try {
            await removeRxDatabase(dbInfo.name, storage);
          } catch (e) {
            window.indexedDB.deleteDatabase(dbInfo.name);
          }
        }
      }
    } else {
      const legacyNames = [
        "indi_ouro_db",
        "indi_ouro_db_v1",
        "indi_ouro_db_v2",
        "indi_ouro_db_v3",
        "indi_ouro_db_v4",
        "indi_ouro_db_v5",
      ];
      for (const name of legacyNames) {
        await removeRxDatabase(name, storage).catch(() => {});
        window.indexedDB.deleteDatabase(name);
      }
    }
  } catch (err) {
    console.error("[RxDB] Error during database cleanup:", err);
  }
}

export function isDatabaseReady(): boolean {
  return dbInstance !== null;
}
