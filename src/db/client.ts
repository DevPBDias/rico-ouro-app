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
import { matrizSchema } from "./schemas/matriz.schema";
import { MyDatabase, MyDatabaseCollections } from "./collections";
import { setupReplication } from "./replication";

// Add core plugins (always loaded)
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBMigrationPlugin);

// Dev-mode plugin - track if loaded
let devModeLoaded = false;

/**
 * Load dev-mode plugin in development
 * Adds readable error messages, mutation protection, and validation checks
 */
async function loadDevModePlugin(): Promise<void> {
  if (devModeLoaded || process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const { RxDBDevModePlugin } = await import("rxdb/plugins/dev-mode");
    addRxPlugin(RxDBDevModePlugin);
    devModeLoaded = true;
    console.log("🔧 RxDB Dev-Mode plugin loaded");
  } catch (err) {
    console.warn("⚠️ Failed to load RxDB dev-mode plugin:", err);
  }
}

const DB_NAME = "indi_ouro_db_v8"; // NEW VERSION - force fresh start

// Global singleton
let dbInstance: MyDatabase | null = null;
let dbPromise: Promise<MyDatabase> | null = null;

/**
 * Create the RxDB database with all collections
 */
async function createDatabase(): Promise<MyDatabase> {
  console.log(`📦 Creating RxDB database (${DB_NAME})...`);

  // Load dev-mode plugin first (development only)
  await loadDevModePlugin();

  let storage: RxStorage<any, any> = getRxStorageDexie();

  // Wrap storage with validator in development
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

    return db;
  } catch (err) {
    console.error("❌ Error creating database:", err);
    throw err;
  }
}

/**
 * Handle database errors - NO AUTO-RELOAD
 */
async function handleDatabaseError(error: any) {
  console.error("❌ RxDB initialization failed:", error);

  // Reset state
  dbInstance = null;
  dbPromise = null;

  // Check if it's a DB9 error
  const isDB9 = error?.code === "DB9" || error?.message?.includes("DB9");

  if (isDB9 && typeof window !== "undefined") {
    console.error("🛑 DB9 Schema Conflict - Manual cleanup required");

    const instructions = `
╔════════════════════════════════════════════════════════════╗
║  ERRO DB9 - CONFLITO DE SCHEMA                             ║
╚════════════════════════════════════════════════════════════╝

⚠️ O banco de dados local precisa ser limpo manualmente.

📋 SOLUÇÃO (escolha uma):

OPÇÃO 1 - Via DevTools (RECOMENDADO):
1. Pressione F12
2. Vá em "Application" → "Storage"  
3. Clique em "Clear site data"
4. FECHE esta aba completamente
5. Abra o app novamente

OPÇÃO 2 - Via Console:
1. Pressione F12 → Console
2. Cole e execute:
   indexedDB.deleteDatabase('indi_ouro_db_v5')
   indexedDB.deleteDatabase('indi_ouro_db_v6')
   indexedDB.deleteDatabase('indi_ouro_db_v7')
   sessionStorage.clear()
   localStorage.clear()
3. FECHE a aba
4. Abra o app novamente

OPÇÃO 3 - Modo Anônimo (TESTE):
1. Abra uma janela anônima/privada
2. Acesse o app
3. Se funcionar, limpe o storage na janela normal

⚠️ IMPORTANTE: Seus dados estão seguros no Supabase!
    `.trim();

    console.log(instructions);

    // Show alert but DON'T reload
    alert(
      "❌ ERRO DB9 - Banco de Dados Corrompido\n\n" +
        "O app não pode continuar com o banco atual.\n\n" +
        "SOLUÇÃO RÁPIDA:\n" +
        "1. Pressione F12\n" +
        "2. Application → Storage → Clear site data\n" +
        "3. FECHE esta aba completamente\n" +
        "4. Abra o app novamente\n\n" +
        "Veja o Console (F12) para mais opções.\n\n" +
        "Seus dados no Supabase estão seguros!"
    );

    // Return rejected promise to stop execution
    return Promise.reject(error);
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
