import { Farm } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const farmSchema: RxJsonSchema<Farm> = {
  title: "farms",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: "number" },
    farmName: { type: "string", maxLength: 200 },
    updatedAt: { type: "string" },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string" },
  },
  required: ["uuid"],
  indexes: ["farmName"],
};
