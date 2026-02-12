import { Death } from "@/types/death.type";
import { RxJsonSchema } from "rxdb";

export const deathSchema: RxJsonSchema<Death> = {
  title: "deaths",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    animal_rgn: { type: "string" },
    date: { type: "string", maxLength: 50 },
    reason: { type: "string" },
    created_at: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 1000000000000000,
    },
    updated_at: { type: "number" },
    _deleted: { type: "boolean" },
  },
  required: [
    "id",
    "animal_rgn",
    "date",
    "reason",
    "created_at",
    "updated_at",
    "_deleted",
  ],
  indexes: ["date", "created_at"],
};
