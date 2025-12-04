import { getDatabase } from "@/db/client";
import { Vaccine } from "@/types/vaccine.type";

/**
 * RSC functions for Vaccines collection
 */

export async function getVaccinesRSC(): Promise<Vaccine[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.vaccines
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ vaccine_name: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as Vaccine);
}

export async function getVaccineRSC(id: string): Promise<Vaccine | null> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const doc = await db.vaccines.findOne(id).exec();
  return doc ? (doc.toJSON() as Vaccine) : null;
}

export async function countVaccinesRSC(): Promise<number> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  return await db.vaccines
    .count({
      selector: {
        _deleted: { $eq: false },
      },
    })
    .exec();
}
