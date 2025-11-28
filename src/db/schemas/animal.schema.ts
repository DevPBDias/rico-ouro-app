import { AnimalData } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const animalSchema: RxJsonSchema<AnimalData> = {
  title: "animals",
  version: 1,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
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

        pesosMedidos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              mes: { type: "string" },
              valor: { type: "number" },
            },
            required: ["mes", "valor"],
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
            required: [
              "initialDate",
              "endDate",
              "days",
              "totalGain",
              "dailyGain",
            ],
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
            required: ["mes", "valor"],
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
            required: ["nome", "data"],
          },
        },

        farm: { type: "string" },
        status: { type: "string" },
      },
      required: [],
    },

    pai: {
      type: "object",
      properties: {
        nome: { type: "string" },
      },
      required: [],
    },

    mae: {
      type: "object",
      properties: {
        serieRGD: { type: "string" },
        rgn: { type: "string" },
      },
      required: [],
    },

    avoMaterno: {
      type: "object",
      properties: {
        nome: { type: "string" },
      },
      required: [],
    },

    _deleted: { type: "boolean", default: false },
    _modified: { type: ["string", "null"] },
  },

  required: ["uuid", "animal", "pai", "mae", "avoMaterno"],
  indexes: ["_modified"],
};
