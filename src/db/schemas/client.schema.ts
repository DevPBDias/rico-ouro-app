import { Client } from "@/types/client.type";
import { RxJsonSchema } from "rxdb";

export const clientSchema: RxJsonSchema<Client> = {
  title: "clients",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    name: { type: "string" },
    cpf_cnpj: { type: "string" },
    inscricao_estadual: { type: "string" },
    phone: { type: "string" },
    farm: { type: "string" },
    city: { type: "string" },
    email: { type: "string" },
    created_at: { type: "number" },
    updated_at: { type: "number" },
    _deleted: { type: "boolean" },
  },
  required: ["id", "name", "cpf_cnpj", "_deleted", "created_at", "updated_at"],
};
