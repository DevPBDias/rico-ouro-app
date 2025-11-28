import { RxJsonSchema } from "rxdb";
import { Farm } from "@/types/schemas.types";

export const farmSchema: RxJsonSchema<Farm> = {
  title: "farms",
  version: 1,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string" },
    id: { type: ["integer", "null"] },
    farmName: { type: "string" },
    _deleted: { type: "boolean", default: false },
    _modified: { type: ["string", "null"] },
  },
  required: ["uuid", "farmName"],
  indexes: ["farmName", "_modified"],
};
