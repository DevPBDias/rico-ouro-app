import { RxJsonSchema } from "rxdb";
import { Matriz } from "@/types/schemas.types";

export const matrizSchema: RxJsonSchema<Matriz> = {
  title: "matriz",
  version: 1,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 36 },
    id: { type: ["integer", "null"] },
    nome: { type: ["string", "null"], maxLength: 200 },
    serieRGD: { type: ["string", "null"] },
    rgn: { type: ["string", "null"] },
    sexo: { type: ["string", "null"] },
    nasc: { type: ["string", "null"] },
    iabcgz: { type: ["string", "null"] },
    deca: { type: ["string", "null"] },
    p: { type: ["string", "null"] },
    f: { type: ["string", "null"] },

    status: {
      type: ["object", "null"],
      properties: {
        label: { type: ["string", "null"] },
        value: { type: ["string", "null"] },
      },
      additionalProperties: true,
    },

    farm: { type: ["string", "null"] },

    vacinas: {
      type: ["array", "null"],
      items: {
        type: "object",
        properties: { nome: { type: "string" }, data: { type: "string" } },
        required: ["nome", "data"],
        additionalProperties: false,
      },
    },

    type: {
      type: ["string", "null"],
      enum: ["Doadora", "Reprodutora", "Receptora FIV", null],
    },
    genotipagem: { type: ["string", "null"], enum: ["Sim", "Não", null] },
    condition: { type: ["string", "null"], enum: ["Parida", "Solteira", null] },

    parturitionFrom: {
      type: ["object", "null"],
      properties: {
        sexo: { type: ["string", "null"], enum: ["M", "F", null] },
        rgn: { type: ["string", "null"] },
      },
      additionalProperties: true,
    },

    protocolosReproducao: {
      type: ["object", "null"],
      additionalProperties: true,
    },
    _deleted: { type: "boolean", default: false },
    updatedAt: { type: "string", maxLength: 40 },
  },

  required: ["uuid", "updatedAt"],
  indexes: ["updatedAt"],
};
