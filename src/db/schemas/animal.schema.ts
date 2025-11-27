import { AnimalData } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const animalSchema: RxJsonSchema<AnimalData> = {
  title: "animals",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: "number" },

    animal: {
      type: "object",
      properties: {
        nome: { type: "string" },
        serieRGD: { type: "string" },
        rgn: { type: "string" },
        sexo: { type: "string" },
        nasc: { type: "string" },
        iabcgz: { type: "string" },
        deca: { type: "string" },
        p: { type: "string" },
        f: { type: "string" },
        corNascimento: { type: "string" },

        pesosMedidos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mes: { type: "string" },
              valor: { type: "number" },
            },
          },
        },

        ganhoDiario: {
          type: "array",
          items: {
            type: "object",
            properties: {
              initialDate: { type: "string" },
              endDate: { type: "string" },
              days: { type: "number" },
              totalGain: { type: "number" },
              dailyGain: { type: "number" },
            },
          },
        },

        circunferenciaEscrotal: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mes: { type: "string" },
              valor: { type: "number" },
            },
          },
        },

        vacinas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              data: { type: "string" },
            },
          },
        },

        farm: { type: "string" },
        status: { type: "string" },
        updatedAt: { type: "string" },
      },
    },

    pai: {
      type: "object",
      properties: {
        nome: { type: "string" },
      },
    },

    mae: {
      type: "object",
      properties: {
        serieRGD: { type: "string" },
        rgn: { type: "string" },
      },
    },

    avoMaterno: {
      type: "object",
      properties: {
        nome: { type: "string" },
      },
    },

    updatedAt: { type: "string", maxLength: 100 },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string" },
  },

  required: ["uuid", "updatedAt"],
  indexes: ["updatedAt"],
};
