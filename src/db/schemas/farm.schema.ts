import { RxJsonSchema } from "rxdb";
import { Farm } from "@/types/schemas.types";

export const farmSchema: RxJsonSchema<Farm> = {
  title: "farms",
  version: 1,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 36 },
    id: { type: ["integer", "null"] },
    farmName: { type: "string", maxLength: 200 },
    _deleted: { type: "boolean", default: false },
    updatedAt: { type: "string", maxLength: 40 },
  },
  required: ["uuid", "farmName", "updatedAt"],
  indexes: ["farmName", "updatedAt"],
};
