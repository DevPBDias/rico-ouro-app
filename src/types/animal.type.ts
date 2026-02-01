import type { IStatus } from "./status.type";

export interface Animal {
  rgn: string;
  name?: string;
  sex?: "M" | "F" | string;
  born_date?: string;
  serie_rgd: string;
  born_color?: string;
  iabcgz?: string;
  deca?: string;
  p?: string;
  f?: string;
  status: IStatus;
  document_situation?: string;
  farm_id?: string;
  classification?: string;
  type?: "Doadora" | "Reprodutora" | "Receptora FIV";
  genotyping?: string;
  condition?: "Parida" | "Solteira";
  parturition_from?: {
    baby_sex?: "M" | "F";
    baby_rgn?: string;
  };
  father_name?: string;
  mother_rgn?: string;
  mother_serie_rgd?: string;
  maternal_grandfather_name?: string;
  paternal_grandfather_name?: string;
  partnership?: string;
  updated_at?: string;
  _deleted: boolean;
}
