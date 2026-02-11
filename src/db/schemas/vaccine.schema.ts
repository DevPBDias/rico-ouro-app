import { Vaccine } from "@/types/vaccine.type";
import { RxJsonSchema } from "rxdb";

export const vaccineSchema: RxJsonSchema<Vaccine> = {
  title: "vaccines",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    vaccine_name: { type: "string", maxLength: 200 },
    created_at: { type: "number" },
    updated_at: { type: "number" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "vaccine_name", "_deleted", "created_at", "updated_at"],
};
