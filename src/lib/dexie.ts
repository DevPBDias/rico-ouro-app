import { IStatus } from "@/types/status-type";
import Dexie from "dexie";

export interface AnimalData {
  id?: number;
  uuid?: string;
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
    status?: IStatus;
    farm?: string;
    circunferenciaEscrotal?: { mes: string; valor: number }[];
    vacinas?: { nome: string; data: string }[];
    updatedAt?: string;
  };
  pai: { nome?: string };
  mae: { serieRGD?: string; rgn?: string };
  avoMaterno: { nome?: string };
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Vaccine {
  id?: number;
  uuid?: string;
  vaccineName: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
export interface Farm {
  id?: number;
  uuid?: string;
  farmName: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
export interface Matriz {
  id?: number;
  uuid?: string;
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
  updatedAt?: string;
  deletedAt?: string | null;
}

// Sync queue item
export interface SyncQueueItem {
  id: string;
  table: "animals" | "farms" | "vaccines" | "matrices";
  operation: "create" | "update" | "delete";
  payload: any;
  uuid?: string;
  createdAt: string;
  retries?: number;
}

export class AppDB extends Dexie {
  animals!: Dexie.Table<AnimalData, number | undefined>;
  farms!: Dexie.Table<Farm, number | undefined>;
  vaccines!: Dexie.Table<Vaccine, number | undefined>;
  matrices!: Dexie.Table<Matriz, number | undefined>;
  syncQueue!: Dexie.Table<SyncQueueItem, string>;
  meta!: Dexie.Table<{ key: string; value: any }, string>;

  constructor() {
    super("jmstudio_db");
    this.version(1).stores({
      animals: "++id, animal.rgn, [animal.serieRGD+animal.rgn], updatedAt, deletedAt, uuid",
      farms: "++id, farmName, updatedAt, deletedAt, uuid",
      vaccines: "++id, vaccineName, updatedAt, deletedAt, uuid",
      matrices: "++id, serieRGD, updatedAt, deletedAt, uuid",
      syncQueue: "id, table, operation, createdAt, uuid",
      meta: "key",
    });
    this.open().catch((err) => {
      console.error("Failed to open db:", err);
    });
  }
}

export const db = new AppDB();
