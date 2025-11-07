import Dexie, { Table } from "dexie";
import { vaccines as defaultVaccines } from "@/constants/vaccinesName";

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
    ganhoDiario?: {
      initialDate: string;
      endDate: string;
      days: number;
      totalGain: number;
      dailyGain: number;
    }[];
    status?: string;
    farm?: string;
    circunferenciaEscrotal?: { mes: string; valor: number }[];
    vacinas?: { nome: string; data: string }[];
    updatedAt?: string;
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
}

export interface Vaccine {
  id?: number;
  vaccineName: string;
}

export class MyDatabase extends Dexie {
  animalData!: Table<AnimalData, number>;
  vaccines!: Table<Vaccine, number>;

  constructor() {
    super("MyDatabase");
    this.version(3).stores({
      animalData: "++id, [animal.serieRGD+animal.rgn], animal.nome, animal.rgn",
    });

    this.version(4)
      .stores({
        animalData:
          "++id, [animal.serieRGD+animal.rgn], animal.nome, animal.rgn",
        vaccines: "++id, &vaccineName",
      })
      .upgrade((transaction) => {
        transaction
          .table("vaccines")
          .bulkPut(defaultVaccines.map(({ vaccineName }) => ({ vaccineName })))
          .catch(() => undefined);
      });
  }
}

export const db = new MyDatabase();

export async function seedVaccines(): Promise<void> {
  await db.transaction("rw", db.vaccines, async () => {
    const existing = await db.vaccines.toArray();
    const existingNames = new Set(
      existing.map((item) => item.vaccineName.toLowerCase())
    );

    const vaccinesToAdd = defaultVaccines.filter(
      ({ vaccineName }) => !existingNames.has(vaccineName.toLowerCase())
    );

    if (vaccinesToAdd.length > 0) {
      await db.vaccines.bulkAdd(
        vaccinesToAdd.map(({ vaccineName }) => ({ vaccineName }))
      );
    }
  });
}
