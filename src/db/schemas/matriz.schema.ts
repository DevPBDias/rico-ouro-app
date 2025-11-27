import { Matriz } from "@/types/schemas.types";
import { RxJsonSchema } from "rxdb";

export const matrizSchema: RxJsonSchema<Matriz> = {
  title: "Matriz Schema",
  version: 0,
  primaryKey: "uuid",
  type: "object",
  properties: {
    uuid: { type: "string", maxLength: 200 },
    id: { type: "number" },
    nome: { type: "string", maxLength: 200 },
    serieRGD: { type: "string" },
    rgn: { type: "string" },
    sexo: { type: "string" },
    nasc: { type: "string" },
    iabcgz: { type: "string" },
    deca: { type: "string" },
    p: { type: "string" },
    f: { type: "string" },
    status: {
      type: "object",
      properties: {
        label: { type: "string" },
        value: { type: "string" },
      },
    },
    farm: { type: "string", maxLength: 200 },
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
    type: {
      type: "string",
      enum: ["Doadora", "Reprodutora", "Receptora FIV"],
    },
    genotipagem: {
      type: "string",
      enum: ["Sim", "Não"],
    },
    condition: {
      type: "string",
      enum: ["Parida", "Solteira"],
    },
    parturitionFrom: {
      type: "object",
      properties: {
        sexo: { type: "string", enum: ["M", "F"] },
        rgn: { type: "string" },
      },
    },
    protocolosReproducao: {
      type: "object",
      properties: {
        classification: { type: "string" },
        iatf: {
          type: "array",
          items: {
            type: "object",
            properties: {
              data: { type: "string" },
              touro: { type: "string" },
              peso: { type: "string" },

              diagnosticoGestacional2: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  type: { type: "string", enum: ["Prenha", "Vazia"] },
                },
              },

              dataPrevistaParto: {
                type: "object",
                properties: {
                  data270: { type: "string" },
                  data305: { type: "string" },
                },
              },
            },
          },
        },
        montaNatural: {
          type: "array",
          items: {
            type: "object",
            properties: {
              data: { type: "string" },
              touro: { type: "string" },
              peso: { type: "string" },
              rgn: { type: "string" },
            },
          },
        },
        fivTETF: {
          type: "array",
          items: {
            type: "object",
            properties: {
              data: { type: "string" },
              doadora: { type: "string" },
              touro: { type: "string" },
              peso: { type: "string" },
              rgn: { type: "string" },

              diagnosticoGestacional: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  type: { type: "string", enum: ["Prenha", "Vazia"] },
                },
              },

              sexo: { type: "string", enum: ["M", "F"] },

              dataPrevistaParto: {
                type: "object",
                properties: {
                  data270: { type: "string" },
                  data305: { type: "string" },
                },
              },
            },
          },
        },
      },
    },

    updatedAt: { type: "string", maxLength: 100 },
    _deleted: { type: "boolean", default: false },
    lastModified: { type: "string" },
  },
  required: ["uuid"],
  indexes: ["nome", "updatedAt", "farm"],
};
