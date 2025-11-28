import { AnimalData, Matriz, Farm, Vaccine } from "./schemas.types";

export interface AnimalDocType extends AnimalData {
  _deleted?: boolean;
  _modified?: string;
}

export interface MatrizDocType extends Matriz {
  _deleted?: boolean;
  _modified?: string;
}

export interface FarmDocType extends Farm {
  _deleted?: boolean;
  _modified?: string;
}

export interface VaccineTypeDocType extends Vaccine {
  _deleted?: boolean;
  _modified?: string;
}
