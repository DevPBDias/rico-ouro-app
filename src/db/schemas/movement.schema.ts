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
      maxLength: 50,
    },
    animal_id: {
      type: "string",
    },
    details_id: {
      type: "string",
      maxLength: 100,
    },
    created_at: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 1000000000000000,
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
    "details_id",
    "created_at",
    "updated_at",
    "_deleted",
  ],
  indexes: ["date", "created_at"],
};
