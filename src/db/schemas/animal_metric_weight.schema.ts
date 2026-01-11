import { AnimalMetric } from "@/types/animal_metrics.type";
import { RxJsonSchema } from "rxdb";

export const animalMetricWeightSchema: RxJsonSchema<AnimalMetric> = {
  title: "animal_weights",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    rgn: { type: "string", maxLength: 10 },
    born_metric: { type: "boolean" },
    date: { type: "string" },
    value: { type: "number" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "rgn"],
  indexes: ["rgn"],
};
