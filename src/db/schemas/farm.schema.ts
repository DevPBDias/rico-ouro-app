import { Farm } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const farmSchema: RxJsonSchema<Farm> = {
  title: "farms",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: ["number", "null"] },
    farmName: { type: "string", maxLength: 200 },
    updatedAt: { type: "string", maxLength: 100 },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string", default: "" },
  },
  required: ["uuid", "farmName"],
  indexes: ["farmName"],
};
