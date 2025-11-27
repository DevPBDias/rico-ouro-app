import { createClient } from "@supabase/supabase-js";
import { AnimalData, Vaccine, Farm, Matriz } from "@/types/schemas.types";

// Variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

if (!isSupabaseConfigured()) {
  console.warn(
    "⚠️ Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nas variáveis de ambiente"
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Tipos para Supabase
export interface SupabaseAnimalData {
  id: string;
  uuid: string;
  animal_json: AnimalData["animal"];
  pai_json: AnimalData["pai"];
  mae_json: AnimalData["mae"];
  avo_materno_json: AnimalData["avoMaterno"];
  created_at: string;
  updated_at: string;
}

export interface SupabaseVaccine {
  id: string;
  uuid: string;
  vaccine_name: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseFarm {
  id: string;
  uuid: string;
  farm_name: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseMatriz {
  id: string;
  uuid: string;
  matriz_json: Matriz;
  created_at: string;
  updated_at: string;
}

// Função auxiliar para remover valores undefined/null de objetos
function removeUndefinedValues(obj: unknown): Record<string, unknown> {
  if (obj === null || obj === undefined) {
    return {};
  }

  if (typeof obj !== "object") {
    return {};
  }

  // Se for array, retorna objeto vazio (não queremos arrays aqui)
  if (Array.isArray(obj)) {
    return {};
  }

  // Se for objeto, limpa recursivamente
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        // Recursivamente limpa objetos aninhados
        const cleanedNested = removeUndefinedValues(value);
        // Só adiciona se o objeto limpo tiver propriedades
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        // Mantém strings, números, etc.
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// Operações AnimalData no Supabase
export async function syncAnimalDataToSupabase(
  animal: AnimalData,
  uuid: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  if (!uuid || uuid.trim() === "") {
    throw new Error("UUID é obrigatório para sincronização");
  }

  // Remove valores undefined/null que podem causar problemas no Supabase
  let cleanAnimal: Record<string, unknown> = removeUndefinedValues(
    animal.animal
  ) as Record<string, unknown>;
  const cleanPai: Record<string, unknown> = removeUndefinedValues(
    animal.pai
  ) as Record<string, unknown>;
  const cleanMae: Record<string, unknown> = removeUndefinedValues(
    animal.mae
  ) as Record<string, unknown>;
  const cleanAvoMaterno: Record<string, unknown> = removeUndefinedValues(
    animal.avoMaterno
  ) as Record<string, unknown>;

  // Garante que animal_json sempre tenha pelo menos um campo (obrigatório)
  if (
    !cleanAnimal ||
    typeof cleanAnimal !== "object" ||
    Array.isArray(cleanAnimal) ||
    Object.keys(cleanAnimal).length === 0
  ) {
    console.warn(
      "⚠️ animal_json está vazio ou inválido, criando objeto mínimo"
    );
    cleanAnimal = {
      rgn: animal.animal.rgn || "",
      updatedAt: animal.animal.updatedAt || new Date().toISOString(),
    };
  }

  // Prepara o payload
  const payload = {
    uuid: uuid.trim(),
    animal_json: cleanAnimal,
    pai_json: cleanPai,
    mae_json: cleanMae,
    avo_materno_json: cleanAvoMaterno,
    updated_at: animal.animal.updatedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("animal_data")
    .upsert(payload, {
      onConflict: "uuid",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao sincronizar animal no Supabase:", error);
    throw new Error(`Erro ao sincronizar animal: ${error.message}`);
  }

  return data.id;
}

export async function deleteAnimalDataFromSupabase(
  uuid: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { error } = await supabase
    .from("animal_data")
    .delete()
    .eq("uuid", uuid);

  if (error) {
    console.error("Erro ao deletar animal no Supabase:", error);
    throw error;
  }
}

export async function fetchAnimalDataFromSupabase(): Promise<
  SupabaseAnimalData[]
> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado, retornando array vazio");
    return [];
  }

  const { data, error } = await supabase
    .from("animal_data")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar animais do Supabase:", error);
    throw error;
  }

  return data || [];
}

// Operações Vaccines no Supabase
export async function syncVaccineToSupabase(
  vaccine: Vaccine,
  uuid: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { data, error } = await supabase
    .from("vaccines")
    .upsert(
      {
        uuid,
        vaccine_name: vaccine.vaccineName,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "uuid",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Erro ao sincronizar vacina no Supabase:", error);
    throw error;
  }

  return data.id;
}

export async function deleteVaccineFromSupabase(uuid: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { error } = await supabase.from("vaccines").delete().eq("uuid", uuid);

  if (error) {
    console.error("Erro ao deletar vacina no Supabase:", error);
    throw error;
  }
}

export async function fetchVaccinesFromSupabase(): Promise<SupabaseVaccine[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado, retornando array vazio");
    return [];
  }

  const { data, error } = await supabase
    .from("vaccines")
    .select("*")
    .order("vaccine_name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar vacinas do Supabase:", error);
    throw error;
  }

  return data || [];
}

// Operações Farms no Supabase
export async function syncFarmToSupabase(
  farm: Farm,
  uuid: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { data, error } = await supabase
    .from("farms")
    .upsert(
      {
        uuid,
        farm_name: farm.farmName,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "uuid",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Erro ao sincronizar fazenda no Supabase:", error);
    throw error;
  }

  return data.id;
}

export async function deleteFarmFromSupabase(uuid: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { error } = await supabase.from("farms").delete().eq("uuid", uuid);

  if (error) {
    console.error("Erro ao deletar fazenda no Supabase:", error);
    throw error;
  }
}

export async function fetchFarmsFromSupabase(): Promise<SupabaseFarm[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado, retornando array vazio");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("farm_name", { ascending: true });

    if (error) {
      if (error.code === "42P01" || error.code === "42501") {
        console.warn(
          `Tabela 'farms' não existe ou sem permissão. Retornando array vazio.`
        );
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro inesperado ao buscar fazendas do Supabase:", error);
    return [];
  }
}

// Operações Matrizes no Supabase
export async function syncMatrizToSupabase(
  matriz: Matriz,
  uuid: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const payload = {
    uuid: uuid.trim(),
    matriz_json: matriz,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("matrizes")
    .upsert(payload, { onConflict: "uuid", ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    console.error("Erro ao sincronizar matriz no Supabase:", error);
    throw error;
  }

  return data.id;
}

export async function deleteMatrizFromSupabase(uuid: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const { error } = await supabase.from("matrizes").delete().eq("uuid", uuid);

  if (error) {
    console.error("Erro ao deletar matriz no Supabase:", error);
    throw error;
  }
}

export async function fetchMatrizesFromSupabase(): Promise<SupabaseMatriz[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase não configurado, retornando array vazio");
    return [];
  }

  const { data, error } = await supabase
    .from("matrizes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar matrizes do Supabase:", error);
    throw error;
  }

  return data || [];
}

// Verifica se está online
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

// Listener de conectividade
export function onOnlineStatusChange(
  callback: (online: boolean) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
