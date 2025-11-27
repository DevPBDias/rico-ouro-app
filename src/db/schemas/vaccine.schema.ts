import { Vaccine } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const vaccineSchema: RxJsonSchema<Vaccine> = {
  title: "vaccines",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: "number" },
    vaccineName: { type: "string", maxLength: 200 },
    updatedAt: { type: "string" },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string" },
  },
  required: ["uuid"],
  indexes: ["vaccineName"],
};
