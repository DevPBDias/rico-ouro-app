import { RxJsonSchema } from "rxdb";

export const movementSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    type: {
      type: "string",
      enum: ["nascimento", "morte", "venda", "troca"],
    },
    date: {
      type: "string", // ISO Date
    },
    animal_id: {
      type: "string",
    },
    description: {
      type: "string",
    },
    details: {
      type: "object", // Generic JSON container for type-specific payloads
    },
    created_at: {
      type: "number",
    },
    updated_at: {
      type: "number",
    },
    _deleted: {
      type: "boolean",
    },
  },
  required: [
    "id",
    "type",
    "date",
    "animal_id",
    "details",
    "created_at",
    "updated_at",
    "_deleted",
  ],
};
