import type { RxJsonSchema } from "rxdb";
import type { SemenDose } from "@/types/semen_dose.type";

export const semenDoseSchema: RxJsonSchema<SemenDose> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    animalName: {
      type: "string",
    },
    breed: {
      type: "string",
    },
    quantity: {
      type: "number",
    },
    updated_at: {
      type: "string",
    },
    _deleted: {
      type: "boolean",
    },
  },
  required: ["id", "animalName", "breed", "quantity"],
};
