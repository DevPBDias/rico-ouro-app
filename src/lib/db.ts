import Dexie, { Table } from "dexie";

export interface AnimalData {
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
    circunferenciaEscrotal?: { mes: string; valor: number }[];
    vacinas?: { nome: string; data: string }[];
    status?: string;
    farm?: string;
    updatedAt?: string;
  };
  pai: {
    nome?: string;
  };
  mae: {
    serieRGD?: string;
    rgn?: string;
  };
}

export class MyDatabase extends Dexie {
  animalData!: Table<AnimalData, number>;

  constructor() {
    super("MyDatabase");
    this.version(3).stores({
      animalData: "++id, [animal.serieRGD+animal.rgn], animal.nome, animal.rgn",
    });
  }
}

export const db = new MyDatabase();
