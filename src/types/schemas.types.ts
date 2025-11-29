import { IStatus } from "./status-type";

export interface AnimalData {
  uuid?: string;
  id?: number;
  animal: {
    nome?: string;
    serieRGD?: string;
    rgn?: string;
    sexo?: string;
    nasc?: string;
    iabcgz?: string;
    deca?: string;
    p?: string;
    f?: string;
    corNascimento?: string;
    pesosMedidos?: { mes: string; valor: number }[];
    ganhoDiario?: {
      initialDate: string;
      endDate: string;
      days: number;
      totalGain: number;
      dailyGain: number;
    }[];
    status?: { label: string; value: string };
    farm?: string;
    circunferenciaEscrotal?: { mes: string; valor: number }[];
    vacinas?: { nome: string; data: string }[];
  };
  pai: {
    nome?: string;
  };
  mae: {
    serieRGD?: string;
    rgn?: string;
  };
  avoMaterno: {
    nome?: string;
  };
  _deleted?: boolean;
  updatedAt?: string;
}

export interface Vaccine {
  id?: number;
  uuid?: string;
  vaccineName: string;
  _deleted?: boolean;
  updatedAt?: string;
}

export interface Farm {
  id?: number;
  uuid?: string;
  farmName: string;
  _deleted?: boolean;
  updatedAt?: string;
}

export interface Matriz {
  nome?: string;
  serieRGD?: string;
  rgn?: string;
  sexo?: string;
  nasc?: string;
  iabcgz?: string;
  deca?: string;
  p?: string;
  f?: string;
  status?: IStatus;
  farm?: string;
  vacinas?: { nome: string; data: string }[];
  type?: "Doadora" | "Reprodutora" | "Receptora FIV";
  genotipagem?: "Sim" | "Não";
  condition?: "Parida" | "Solteira";
  parturitionFrom?: {
    sexo?: "M" | "F";
    rgn?: string;
  };
  protocolosReproducao?: {
    classification?: string;
    iatf?: {
      data?: string;
      touro?: string;
      peso?: string;
      diagnosticoGestacional2?: {
        data?: string;
        type?: "Prenha" | "Vazia";
      };
      dataPrevistaParto?: {
        data270?: string;
        data305?: string;
      };
    }[];
    montaNatural: {
      data: string;
      touro?: string;
      peso?: string;
      rgn?: string;
    }[];
    fivTETF?: {
      data?: string;
      doadora?: string;
      touro?: string;
      peso?: string;
      rgn?: string;
      diagnosticoGestacional?: {
        data?: string;
        type?: "Prenha" | "Vazia";
      };
      sexo?: "M" | "F";
      dataPrevistaParto?: {
        data270?: string;
        data305?: string;
      };
    }[];
  };
  id?: number;
  uuid?: string;
  _deleted?: boolean;
  updatedAt?: string;
}
