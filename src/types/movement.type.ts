export type MovementType = "nascimento" | "morte" | "venda" | "troca";

export interface MortePayload {
  reason: string;
}

export interface SalePayload {
  sale_type: "abate" | "comprado";
  sale_id?: string;
  client_id: string;
  total_value?: number;
  down_payment?: number;
  payment_method?: string;
  installments?: number;
  financial_status?: string;
  gta_number?: string;
  invoice_number?: string;
}

export interface TrocaPayload {
  client_id: string;
  traded_animal_rgn: string; // The animal being traded out
  substitute_animal_rgn?: string; // The animal coming in (optional at this stage?)
  value_difference?: number;
}

export interface NascimentoPayload {
  mother_rgn: string;
  sex: "M" | "F";
  weight?: number;
  born_date: string;
}

export interface Movement {
  id: string;
  type: MovementType;
  date: string; // ISO Date
  animal_id: string; // RGN of the main animal involved
  description: string;
  details: MortePayload | SalePayload | TrocaPayload | NascimentoPayload;
  created_at?: string;
  updated_at?: string;
  _deleted: boolean;
}
