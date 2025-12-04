export interface Vaccine {
  id: string;
  vaccine_name: string;
  updated_at?: string;
  _deleted?: boolean;
}

export interface AnimalVaccine {
  id: string;
  rgn: string;
  vaccine_id: string;
  date?: string;
  updated_at?: string;
  _deleted?: boolean;
}
