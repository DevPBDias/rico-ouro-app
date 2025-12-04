import { Vaccine } from "@/types/vaccine.type";
import { RxJsonSchema } from "rxdb";

export const vaccineSchema: RxJsonSchema<Vaccine> = {
  title: "vaccines",
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 10 },
    vaccine_name: { type: "string", maxLength: 200 },
    _deleted: { type: "boolean", default: false },
    updated_at: { type: "string", maxLength: 40 },
  },
  required: ["id", "vaccine_name"],
};
