import { AnimalData } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const animalSchema: RxJsonSchema<AnimalData> = {
  title: "animals",
  version: 2,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 36 },
    id: { type: ["number", "null"] },

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
        farm: { type: "string" },
        status: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" },
          },
          additionalProperties: true,
        },

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

    _deleted: { type: "boolean" },
    updatedAt: { type: "string", maxLength: 40 },
  },

  required: ["uuid", "updatedAt", "_deleted"],
  indexes: [["_deleted", "updatedAt", "uuid"]],
};
