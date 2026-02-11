import { Farm } from "@/types/farm.type";
import { RxJsonSchema } from "rxdb";

export const farmSchema: RxJsonSchema<Farm> = {
  title: "farm schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    farm_name: { type: "string" },
    created_at: { type: "number" },
    updated_at: { type: "number" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "farm_name", "_deleted", "created_at", "updated_at"],
};
