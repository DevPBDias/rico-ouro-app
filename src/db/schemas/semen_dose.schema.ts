import type { RxJsonSchema } from "rxdb";
import type { SemenDose } from "@/types/semen_dose.type";

export const semenDoseSchema: RxJsonSchema<SemenDose> = {
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    animal_name: {
      type: "string",
    },
    animal_image: {
      type: "string",
    },
    father_name: {
      type: "string",
    },
    maternal_grandfather_name: {
      type: "string",
    },
    iabcz: {
      type: "string",
    },
    registration: {
      type: "string",
    },
    center_name: {
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
  required: ["id", "animal_name", "breed", "quantity"],
};
