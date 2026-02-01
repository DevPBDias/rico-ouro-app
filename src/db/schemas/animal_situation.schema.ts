import { RxJsonSchema } from "rxdb";
import { AnimalSituation } from "@/types/situation.type";

export const animalSituationSchema: RxJsonSchema<AnimalSituation> = {
  title: "animal_situation schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    situation_name: { type: "string" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "situation_name", "_deleted", "updated_at"],
};
