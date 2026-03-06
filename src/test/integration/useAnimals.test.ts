import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTestDb } from "../helpers/db";
import { v4 as uuidv4 } from "uuid";
import { removeRxDatabase } from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";

// Mock implementation to inject our test DB instead of the real one
vi.mock("@/hooks/core/useLocalDocument", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/hooks/core/useLocalDocument")>();
  return {
    ...actual,
    useLocalDocument: vi.fn(),
  };
});

describe.skip("Integration: useAnimals Hook with RxDB", () => {
  let db: any;

  beforeEach(async () => {
    db = await createTestDb();

    // Seed some test data
    await db.animals.insert({
      id: uuidv4(),
      rgn: "9999",
      name: "Animal InMemory",
      gender: "Macho",
      status: "Ativo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _deleted: false,
    });
  });

  afterEach(async () => {
    try {
      if (db) {
        // Clear all docs since we use singleton db
        await db.animals.find().remove();
      }
    } catch (e) {
      /* ignore */
    }
  });

  it("should fetch active animals from the local in-memory database", async () => {
    // Basic test to verify the in-memory db setup works
    const animals = await db.animals
      .find({
        selector: {
          _deleted: { $eq: false },
        },
      })
      .exec();

    expect(animals.length).toBe(1);
    expect(animals[0].rgn).toBe("9999");
  });
});
