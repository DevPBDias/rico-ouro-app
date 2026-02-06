import { Sale } from "@/types/sale.type";
import { RxJsonSchema } from "rxdb";

export const saleSchema: RxJsonSchema<Sale> = {
  title: "sales",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 36 },
    animal_rgn: { type: "string" },
    client_id: { type: "string", maxLength: 36 },
    date: { type: "string" },
    total_value: { type: "number" },
    down_payment: { type: "number" },
    payment_method: { type: "string" },
    installments: { type: "integer" },
    financial_status: { type: "string" },
    gta_number: { type: "string" },
    invoice_number: { type: "string" },
    updated_at: { type: "string" },
    _deleted: { type: "boolean" },
    sale_type: { type: "string" },
  },
  required: ["id", "animal_rgn", "client_id", "date", "updated_at", "_deleted"],
};
