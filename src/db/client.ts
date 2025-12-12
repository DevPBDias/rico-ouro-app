"use client";

import { createRxDatabase, addRxPlugin, RxStorage } from "rxdb";
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

const DB_NAME = "indi_ouro_db";

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
    });
    setupReplication(db).catch((err: Error) => {});

    return db;
  } catch (err) {
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
    .catch((error) => {
      console.log(error);
      throw error;
    });

  return dbPromise as Promise<MyDatabase>;
}

export function isDatabaseReady(): boolean {
  return dbInstance !== null;
}
