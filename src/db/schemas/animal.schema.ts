import { Animal } from "@/types/animal.type";
import { RxJsonSchema } from "rxdb";

export const animalSchema: RxJsonSchema<Animal> = {
  title: "animals",
  version: 0,
  primaryKey: "rgn",
  type: "object",
  properties: {
    rgn: { type: "string", maxLength: 10 },
    name: { type: "string" },
    sex: { type: "string" },
    born_date: { type: "string", format: "date" },
    serie_rgd: { type: "string" },
    born_color: { type: "string" },
    iabcgz: { type: "string" },
    deca: { type: "string" },
    p: { type: "string" },
    f: { type: "string" },
    status: { type: "string" },
    document_situation: { type: "string" },
    farm_id: { type: "string", maxLength: 36 },
    type: { type: "string" },
    genotyping: { type: "string" },
    condition: { type: "string" },
    classification: { type: "string" },
    parturition_from: {
      type: "object",
      properties: {
        baby_sex: { type: "string" },
        baby_rgn: { type: "string" },
      },
    },
    father_name: { type: "string" },
    mother_serie_rgd: { type: "string" },
    mother_rgn: { type: "string" },
    maternal_grandfather_name: { type: "string" },
    paternal_grandfather_name: { type: "string" },
    partnership: { type: "string" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
  },
  required: ["rgn", "serie_rgd", "_deleted", "updated_at"],
};
