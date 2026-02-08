import { Sale } from "./sale.type";

export type MovementType = "morte" | "venda" | "troca";

export interface MortePayload {
  reason: string;
}

export interface SalePayload extends Sale {
  sale_id?: string;
}

export interface TrocaPayload {
  client_id: string;
  traded_animal_rgn: string; // The animal being traded out
  substitute_animal_rgn?: string; // The animal coming in (optional at this stage?)
  value_difference?: number;
}

export interface Movement {
  id: string;
  type: MovementType;
  date: string; // ISO Date
  animal_id: string; // RGN of the main animal involved
  description: string;
  details: MortePayload | SalePayload | TrocaPayload;
  created_at?: string;
  updated_at?: string;
  _deleted: boolean;
}
