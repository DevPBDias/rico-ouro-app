import { Vaccine } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const vaccineSchema: RxJsonSchema<Vaccine> = {
  title: "vaccines",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: ["number", "null"] },
    vaccineName: { type: "string", maxLength: 200 },
    updatedAt: { type: "string", maxLength: 100 },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string", default: "" },
  },
  required: ["uuid", "vaccineName"],
  indexes: ["vaccineName"],
};
