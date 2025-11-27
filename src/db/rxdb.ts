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

let dbPromise: Promise<MyDatabase> | null = null;

// Use v4 to avoid schema conflicts with previous versions
const DB_NAME = "indi_ouro_db";

const createDatabase = async (): Promise<MyDatabase> => {
  console.log("� Initializing RxDB...");

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

    console.log("�📦 Adding collections...");
    await db.addCollections({
      animals: { schema: animalSchema },
      vaccines: { schema: vaccineSchema },
      farms: { schema: farmSchema },
      matriz: { schema: matrizSchema },
    });

    if (
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
      console.warn("⚠️ Supabase credentials not found. Replication disabled.");
    }

    console.log("✅ RxDB initialized!");
    return db;
  } catch (error) {
    // Handle schema conflicts (DB9 error) or any database creation error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.code || "";

    console.error("Database initialization error:", error);

    if (errorMessage.includes("DB9") || errorCode === "DB9") {
      console.warn(
        "⚠️ Schema conflict detected (DB9). Removing old databases and retrying..."
      );

      // Try to remove all possible old database versions
      const oldDbNames = [
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
    }

    // Re-throw other errors
    throw error;
  }
};

export const getDatabase = (): Promise<MyDatabase> => {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};
