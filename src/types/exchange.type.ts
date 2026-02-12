export interface Exchange {
  id: string;
  animal_rgn: string;
  date: string; // ISO Date YYYY-MM-DD
  client_id: string;
  traded_animal_rgn: string;
  substitute_animal_rgn?: string;
  value_difference?: number;
  created_at: number;
  updated_at: number;
  _deleted: boolean;
}
