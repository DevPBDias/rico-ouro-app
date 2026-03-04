import { Sale } from "./sale.type";

export type MovementType = "morte" | "venda" | "troca";

export interface MortePayload {
  reason: string;
}

export interface SalePayload extends Partial<Sale> {}

export interface TrocaPayload {
  client_id: string;
  traded_animal_rgn: string;
  substitute_animal_rgn?: string;
  value_difference?: number;
}

export interface Movement {
  id: string;
  type: MovementType;
  date: string; // ISO Date
  animal_id: string; // RGN of the main animal involved
  details_id: string;
  created_at: number;
  updated_at: number;
  _deleted: boolean;
}
