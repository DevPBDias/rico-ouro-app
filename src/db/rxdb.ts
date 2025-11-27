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

const createDatabase = async (): Promise<MyDatabase> => {
  console.log("🚀 Initializing RxDB...");

  // Use validated storage in development mode
  const storage =
    process.env.NODE_ENV === "development"
      ? wrappedValidateAjvStorage({ storage: getRxStorageDexie() })
      : getRxStorageDexie();

  try {
    const db = await createRxDatabase<MyDatabaseCollections>({
      name: "rico_ouro_db_v2", // New name to avoid conflicts with old DB
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
    // Handle schema conflicts (DB9 error)
    if (error instanceof Error && error.message.includes("DB9")) {
      console.warn(
        "⚠️ Schema conflict detected. Removing old database and retrying..."
      );

      // Remove the old database
      try {
        await removeRxDatabase("rico_ouro_db_v2", storage);
      } catch (removeError) {
        console.error("Failed to remove old database:", removeError);
      }

      // Retry database creation
      const db = await createRxDatabase<MyDatabaseCollections>({
        name: "rico_ouro_db_v2",
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
    console.error("Failed to initialize RxDB:", error);
    throw error;
  }
};

export const getDatabase = (): Promise<MyDatabase> => {
  if (!dbPromise) {
    dbPromise = createDatabase();
  }
  return dbPromise;
};
