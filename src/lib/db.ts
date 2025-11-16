import { dbAdapter as db } from "./db-adapter";
import { initSQLite } from "./sqlite-db";
import {
  fetchVaccinesFromSupabase,
  fetchFarmsFromSupabase,
  isSupabaseConfigured,
} from "./supabase-client";
import { vaccines as defaultVaccines } from "@/constants/vaccinesName";
import { farms as defaultFarms } from "@/constants/farmName";
import type { IStatus } from "@/types/status-type";

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
    status?: IStatus;
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

export interface Farm {
  id?: number;
  farmName: string;
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
}

if (typeof window !== "undefined") {
  initSQLite().catch((error) => {
    console.error("Erro ao inicializar SQLite:", error);
  });
}

export { db };

export async function seedVaccines(): Promise<void> {
  await db.transaction("rw", [db.vaccines], async () => {
    const existing = await db.vaccines.toArray();
    const existingNames = new Set(
      existing.map((item) => item.vaccineName.toLowerCase())
    );

    let vaccinesToAdd: { vaccineName: string }[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabaseVaccines = await fetchVaccinesFromSupabase();
        vaccinesToAdd = supabaseVaccines
          .map((v) => ({ vaccineName: v.vaccine_name }))
          .filter(
            (vaccine) => !existingNames.has(vaccine.vaccineName.toLowerCase())
          );

        if (vaccinesToAdd.length > 0) {
          const { addVaccine } = await import("./sqlite-db");
          for (const supabaseVaccine of supabaseVaccines) {
            if (
              !existingNames.has(supabaseVaccine.vaccine_name.toLowerCase())
            ) {
              await addVaccine(
                { vaccineName: supabaseVaccine.vaccine_name },
                supabaseVaccine.uuid
              );
            }
          }
          return;
        }
      } catch (error) {
        console.warn(
          "Erro ao buscar vacinas do Supabase, usando constantes:",
          error
        );
      }
    }

    vaccinesToAdd = defaultVaccines.filter(
      (vaccine: { vaccineName: string }) =>
        !existingNames.has(vaccine.vaccineName.toLowerCase())
    );

    if (vaccinesToAdd.length > 0) {
      await db.vaccines.bulkAdd(
        vaccinesToAdd.map((vaccine: { vaccineName: string }) => ({
          vaccineName: vaccine.vaccineName,
        }))
      );
    }
  });
}

export async function seedFarms(): Promise<void> {
  await db.transaction("rw", [db.farms], async () => {
    const existing = await db.farms.toArray();
    const existingNames = new Set(
      existing.map((item) => item.farmName.toLowerCase())
    );

    let farmsToAdd: { farmName: string }[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabaseFarms = await fetchFarmsFromSupabase();
        farmsToAdd = supabaseFarms
          .map((f) => ({ farmName: f.farm_name }))
          .filter((farm) => !existingNames.has(farm.farmName.toLowerCase()));

        if (farmsToAdd.length > 0) {
          const { addFarm } = await import("./sqlite-db");
          for (const supabaseFarm of supabaseFarms) {
            if (!existingNames.has(supabaseFarm.farm_name.toLowerCase())) {
              await addFarm(
                { farmName: supabaseFarm.farm_name },
                supabaseFarm.uuid
              );
            }
          }
          return;
        }
      } catch (error) {
        console.warn(
          "Erro ao buscar fazendas do Supabase, usando constantes:",
          error
        );
      }
    }

    farmsToAdd = defaultFarms.filter(
      (farm: { farmName: string }) =>
        !existingNames.has(farm.farmName.toLowerCase())
    );

    if (farmsToAdd.length > 0) {
      await db.farms.bulkAdd(farmsToAdd.map(({ farmName }) => ({ farmName })));
    }
  });
}
