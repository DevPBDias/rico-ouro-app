// Importações primeiro
import { dbAdapter as db } from "./db-adapter";
import { initSQLite } from "./sqlite-db";
import {
  fetchVaccinesFromSupabase,
  fetchFarmsFromSupabase,
  isSupabaseConfigured,
} from "./supabase-client";
// Importações de constantes como fallback (arrays vazios se não houver dados no Supabase)
import { vaccines as defaultVaccines } from "@/constants/vaccinesName";
import { farms as defaultFarms } from "@/constants/farmName";
import type { IStatus } from "@/constants/status-type";

// Exporta tipos (mantidos para compatibilidade)
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

// Inicializa SQLite na primeira importação
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

    // Tenta buscar do Supabase primeiro
    if (isSupabaseConfigured()) {
      try {
        const supabaseVaccines = await fetchVaccinesFromSupabase();
        vaccinesToAdd = supabaseVaccines
          .map((v) => ({ vaccineName: v.vaccine_name }))
          .filter(
            (vaccine) => !existingNames.has(vaccine.vaccineName.toLowerCase())
          );

        // Se encontrou vacinas no Supabase, adiciona com UUID
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
          return; // Sai da função se conseguiu buscar do Supabase
        }
      } catch (error) {
        console.warn(
          "Erro ao buscar vacinas do Supabase, usando constantes:",
          error
        );
        // Continua para usar constantes como fallback
      }
    }

    // Fallback: usa constantes se Supabase não estiver configurado ou houver erro
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

    // Tenta buscar do Supabase primeiro
    if (isSupabaseConfigured()) {
      try {
        const supabaseFarms = await fetchFarmsFromSupabase();
        farmsToAdd = supabaseFarms
          .map((f) => ({ farmName: f.farm_name }))
          .filter((farm) => !existingNames.has(farm.farmName.toLowerCase()));

        // Se encontrou fazendas no Supabase, adiciona com UUID
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
          return; // Sai da função se conseguiu buscar do Supabase
        }
      } catch (error) {
        console.warn(
          "Erro ao buscar fazendas do Supabase, usando constantes:",
          error
        );
        // Continua para usar constantes como fallback
      }
    }

    // Fallback: usa constantes se Supabase não estiver configurado ou houver erro
    farmsToAdd = defaultFarms.filter(
      (farm: { farmName: string }) =>
        !existingNames.has(farm.farmName.toLowerCase())
    );

    if (farmsToAdd.length > 0) {
      await db.farms.bulkAdd(farmsToAdd.map(({ farmName }) => ({ farmName })));
    }
  });
}
