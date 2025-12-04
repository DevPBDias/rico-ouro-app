import { getDatabase } from "@/db/client";
import { AnimalVaccine } from "@/types/vaccine.type";

/**
 * RSC functions for Animal Vaccines collection
 */

export async function getAnimalVaccinesRSC(): Promise<AnimalVaccine[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.animal_vaccines
    .find({
      selector: {
        deleted: { $eq: false },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalVaccine);
}

export async function getAnimalVaccineRSC(
  id: number
): Promise<AnimalVaccine | null> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const doc = await db.animal_vaccines.findOne(id.toString()).exec();
  return doc ? (doc.toJSON() as AnimalVaccine) : null;
}

export async function getAnimalVaccinesByRgnRSC(
  rgn: string
): Promise<AnimalVaccine[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.animal_vaccines
    .find({
      selector: {
        deleted: { $eq: false },
        rgn: { $eq: rgn },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalVaccine);
}

export async function getAnimalVaccinesByVaccineIdRSC(
  vaccineId: string
): Promise<AnimalVaccine[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.animal_vaccines
    .find({
      selector: {
        deleted: { $eq: false },
        vaccine_id: { $eq: vaccineId },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalVaccine);
}

export async function countAnimalVaccinesRSC(): Promise<number> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  return await db.animal_vaccines
    .count({
      selector: {
        deleted: { $eq: false },
      },
    })
    .exec();
}
