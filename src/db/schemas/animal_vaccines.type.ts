import { AnimalVaccine } from "@/types/vaccine.type";
import { RxJsonSchema } from "rxdb";

export const animalVaccineSchema: RxJsonSchema<AnimalVaccine> = {
  title: "animal_vaccines",
  version: 2,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    rgn: { type: "string", maxLength: 10 },
    vaccine_id: { type: "string", maxLength: 36 },
    date: { type: "string", format: "date" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "rgn", "vaccine_id"],
  indexes: ["rgn", "vaccine_id"],
};
