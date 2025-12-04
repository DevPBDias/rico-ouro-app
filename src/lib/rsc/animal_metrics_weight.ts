import { getDatabase } from "@/db/client";
import { AnimalMetric } from "@/types/animal_metrics.type";

/**
 * RSC functions for Animal Metrics Weight collection
 */

export async function getAnimalMetricsWeightRSC(): Promise<AnimalMetric[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.animal_metrics_weight
    .find({
      selector: {
        deleted: { $eq: false },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalMetric);
}

export async function getAnimalMetricWeightRSC(
  id: number
): Promise<AnimalMetric | null> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const doc = await db.animal_metrics_weight.findOne(id.toString()).exec();
  return doc ? (doc.toJSON() as AnimalMetric) : null;
}

export async function getAnimalMetricsWeightByRgnRSC(
  rgn: string
): Promise<AnimalMetric[]> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  const docs = await db.animal_metrics_weight
    .find({
      selector: {
        deleted: { $eq: false },
        rgn: { $eq: rgn },
      },
      sort: [{ date: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalMetric);
}

export async function countAnimalMetricsWeightRSC(): Promise<number> {
  const db = await getDatabase();
  if (!db) throw new Error("Database not initialized");
  return await db.animal_metrics_weight
    .count({
      selector: {
        deleted: { $eq: false },
      },
    })
    .exec();
}
