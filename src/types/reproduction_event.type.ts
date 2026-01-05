export interface ReproductionEvent {
  id: string;
  rgn: string;
  type: "IATF" | "MONTA NATURAL" | "FIV-TETF";
  date?: string;
  weight?: string;
  bull?: string;
  donor?: string;
  rgn_bull?: string;
  gestation_diagnostic_date?: string;
  gestation_diagnostic_type?: "Prenha" | "Vazia";
  expected_sex?: "M" | "F";
  expected_birth_date_270?: string;
  expected_birth_date_305?: string;
  updated_at: string;
  _deleted: boolean;
}
