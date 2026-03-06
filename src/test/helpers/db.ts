import { createRxDatabase, addRxPlugin } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { animalSchema } from "@/db/schemas/animal.schema";

// add plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

let testDbInstance: any = null;

export async function createTestDb() {
  if (testDbInstance) {
    return testDbInstance;
  }
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36);
  const db = await createRxDatabase({
    name: "testdb_" + Date.now() + "_" + random, // Unique name for each test
    storage: getRxStorageMemory(), // Use memory storage for tests
    ignoreDuplicate: true,
  });

  await db.addCollections({
    animals: {
      schema: animalSchema,
    },
  });

  testDbInstance = db;
  return db;
}
