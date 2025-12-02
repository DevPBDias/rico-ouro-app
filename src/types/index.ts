import { StaticImageData } from "next/image";

export type Screen = "splash" | "login" | "home" | "animal" | "settings";

export interface Animal {
  id: string;
  name: string;
  currentWeight: number;
  fatherName: string;
  motherName: string;
  birthDate: string;
  age: string;
  iABCZg: number;
  deca: number;
  pPercent: string;
  fPercent: number;
}

export interface SettingsOption {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export interface Links {
  id: number;
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }> | string;
  iconSrc?: string | StaticImageData;
}

export interface SelectedReportFields {
  nomeAnimal: boolean;
  rgn: boolean;
  serieRGD: boolean;
  sexo: boolean;
  dataNascimento: boolean;
  corNascimento: boolean;
  iabcgz: boolean;
  deca: boolean;
  p: boolean;
  f: boolean;
  pesosMedidos: boolean;
  circunferenciaEscrotal: boolean;
  vacinas: boolean;
  nomePai: boolean;
  maeSerieRGD: boolean;
  maeRGN: boolean;
  status: boolean;
  farm: boolean;
  ganhoDiario: boolean;
}
