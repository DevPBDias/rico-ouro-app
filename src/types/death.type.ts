export interface Death {
  id: string;
  animal_rgn: string;
  date: string; // ISO Date YYYY-MM-DD
  reason: string;
  created_at: number;
  updated_at: number;
  _deleted: boolean;
}
