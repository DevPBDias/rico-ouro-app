import { Vaccine } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const vaccineSchema: RxJsonSchema<Vaccine> = {
  title: "vaccines",
  version: 1,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: ["number", "null"] },
    vaccineName: { type: "string", maxLength: 200 },
    _deleted: { type: "boolean", default: false },
    _modified: { type: ["string", "null"] },
  },
  required: ["uuid", "vaccineName"],
  indexes: ["vaccineName"],
};
