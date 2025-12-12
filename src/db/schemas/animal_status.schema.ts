import { AnimalStatus } from "@/types/status.type";
import { RxJsonSchema } from "rxdb";

export const animalStatusSchema: RxJsonSchema<AnimalStatus> = {
  title: "animal_status schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    status_name: { type: "string" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "status_name"],
};
