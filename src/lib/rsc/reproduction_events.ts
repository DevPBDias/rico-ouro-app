import { getDatabase } from "@/db/client";
import { ReproductionEvent } from "@/types/reproduction_event.type";

/**
 * RSC functions for Reproduction Events collection
 */

export async function getReproductionEventsRSC(): Promise<ReproductionEvent[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.reproduction_events
    .find({
      selector: {
        deleted: { $eq: false },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as ReproductionEvent);
}

export async function getReproductionEventRSC(
  id: number
): Promise<ReproductionEvent | null> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const doc = await db.reproduction_events.findOne(id.toString()).exec();
  return doc ? (doc.toJSON() as ReproductionEvent) : null;
}

export async function getReproductionEventsByRgnRSC(
  rgn: string
): Promise<ReproductionEvent[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.reproduction_events
    .find({
      selector: {
        deleted: { $eq: false },
        rgn: { $eq: rgn },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as ReproductionEvent);
}

export async function getReproductionEventsByTypeRSC(
  type: "IATF" | "MONTA NATURAL" | "FIV-TETF"
): Promise<ReproductionEvent[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.reproduction_events
    .find({
      selector: {
        deleted: { $eq: false },
        type: { $eq: type },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as ReproductionEvent);
}

export async function countReproductionEventsRSC(): Promise<number> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  return await db.reproduction_events
    .count({
      selector: {
        deleted: { $eq: false },
      },
    })
    .exec();
}
