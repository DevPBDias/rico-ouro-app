import { getDatabase } from "@/db/client";
import { Farm } from "@/types/farm.type";

export async function getFarmsRSC(): Promise<Farm[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.farms
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ farm_name: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as Farm);
}

export async function getFarmRSC(id: string): Promise<Farm | null> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const doc = await db.farms.findOne(id).exec();
  return doc ? (doc.toJSON() as Farm) : null;
}

export async function countFarmsRSC(): Promise<number> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  return await db.farms
    .count({
      selector: {
        _deleted: { $eq: false },
      },
    })
    .exec();
}
