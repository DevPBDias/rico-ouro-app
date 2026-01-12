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
    _deleted: { type: "boolean", default: false },
    updated_at: { type: "string", maxLength: 40 },
  },
  required: ["id", "vaccine_name", "_deleted", "updated_at"],
};
