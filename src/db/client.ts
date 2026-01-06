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
  if (devModeLoaded || process.env.NODE_ENV !== "development") {
    return;
  }

  try {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);
    devModeLoaded = true;
    console.log("[RxDB] Dev-mode plugin loaded");
  } catch (err) {
    console.warn("[RxDB] Failed to load dev-mode plugin", err);
  }
}

const DB_VERSION = "v9";
const DB_NAME = `indi_ouro_db_${DB_VERSION}`;

let storageInstance: RxStorage<any, any> | null = null;

function getStorage() {
  if (!storageInstance) {
    storageInstance = getRxStorageDexie();
    if (process.env.NODE_ENV === "development") {
      storageInstance = wrappedValidateAjvStorage({
        storage: storageInstance,
      });
    }
  }
  return storageInstance;
}

let dbInstance: MyDatabase | null = null;
let dbPromise: Promise<MyDatabase> | null = null;

async function createDatabase(): Promise<MyDatabase> {
  await loadDevModePlugin();

  const storage = getStorage();

  try {
    const db = await createRxDatabase<MyDatabaseCollections>({
      name: DB_NAME,
      storage: storage,
      multiInstance: true,
      // ignoreDuplicate só é permitido em dev-mode (erro DB9 em produção)
      ignoreDuplicate: process.env.NODE_ENV === "development",
      eventReduce: true,
    });

    // Se o banco foi retornado de uma chamada anterior (ignoreDuplicate),
    // ele pode já ter as coleções. Verificamos uma para decidir.
    if (db.collections.animals) {
      console.log(
        "[RxDB] Collections already initialized, skipping addCollections"
      );
      return db;
    }

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
          // Versão 0 não precisa de migration strategies
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

      // Limpeza crítica: Se as coleções falharem, fechamos a instância do banco
      // para evitar o erro DB9 (já aberto) em tentativas subsequentes no mesmo processo.
      try {
        await db.close();
      } catch (closeErr) {
        console.error(
          "[RxDB] Failed to close db after collection error",
          closeErr
        );
      }

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
      // Reset promises to allow retry
      dbPromise = null;
      dbInstance = null;
      throw error;
    });

  return dbPromise as Promise<MyDatabase>;
}

export async function clearAllDatabases(): Promise<void> {
  if (typeof window === "undefined") return;

  console.log("[RxDB] Starting full local database purge...");

  // 1. Destruir a instância ativa se existir
  if (dbInstance) {
    try {
      await dbInstance.close();
      dbInstance = null;
      dbPromise = null;
    } catch (err) {
      console.error("[RxDB] Error destroying current instance:", err);
    }
  }

  // 2. Limpar localStorage (pode conter metadados e tokens)
  try {
    localStorage.clear();
    console.log("[RxDB] LocalStorage cleared");
  } catch (e) {}

  // 3. Força Bruta no IndexedDB
  try {
    if (window.indexedDB && (window.indexedDB as any).databases) {
      const dbs = await (window.indexedDB as any).databases();

      for (const dbInfo of dbs) {
        const name = dbInfo.name;
        if (!name) continue;

        // Padrões de nomes que queremos deletar (abrange RxDB, Dexie e filas antigas)
        const shouldDelete =
          name.includes("indi_ouro") ||
          name.includes("rxdb") ||
          name.includes("dexie") ||
          name.includes("offline-sync");

        if (shouldDelete) {
          console.log(`[RxDB] Purging IndexedDB: ${name}`);
          window.indexedDB.deleteDatabase(name);
        }
      }
    } else {
      // Fallback para navegadores antigos
      const commonNames = [
        "indi_ouro_db",
        "indi_ouro_db_v1",
        "indi_ouro_db_v2",
        "indi_ouro_db_v3",
        "indi_ouro_db_v4",
        "indi_ouro_db_v5",
        "indi_ouro_db_v6",
        "indi_ouro_db_v7",
        "indi_ouro_db_v8",
        "indi_ouro_db_v9",
        "offline-sync-queue",
      ];
      commonNames.forEach((name) => window.indexedDB.deleteDatabase(name));
    }
    console.log("[RxDB] Full purge complete.");
  } catch (err) {
    console.error("[RxDB] Critical error during database cleanup:", err);
  }
}

export function isDatabaseReady(): boolean {
  return dbInstance !== null;
}
