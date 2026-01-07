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
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "farm_name"],
};
