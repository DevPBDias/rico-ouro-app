import { AnimalData, Vaccine, Farm, Matriz } from "@/types/schemas.types";
import { getSupabase } from "./client";

// Variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Helper function to normalize animal data
function normalizeAnimalData(animal: AnimalData): AnimalData {
  return {
    uuid: animal.uuid,
    id: animal.id,
    animal: animal.animal || {
      nome: "",
      serieRGD: "",
      rgn: "",
      sexo: "",
      nasc: "",
      iabcgz: "",
      deca: "",
      p: "",
      f: "",
      corNascimento: "",
      farm: "",
      status: { label: "", value: "" },
      pesosMedidos: [],
      ganhoDiario: [],
      circunferenciaEscrotal: [],
      vacinas: [],
    },
    pai: animal.pai || { nome: "" },
    mae: animal.mae || { serieRGD: "", rgn: "" },
    avoMaterno: animal.avoMaterno || { nome: "" },
    _deleted: animal._deleted || false,
    updatedAt: animal.updatedAt || new Date().toISOString(),
  };
}

// Tipos para Supabase
export interface SupabaseAnimalData {
  id: string;
  uuid: string;
  animal_json: AnimalData["animal"];
  pai_json: AnimalData["pai"];
  mae_json: AnimalData["mae"];
  avo_materno_json: AnimalData["avoMaterno"];
  created_at: string;
  updatedAt: string;
}

export interface SupabaseVaccine {
  id: string;
  uuid: string;
  vaccine_name: string;
  created_at: string;
  updatedAt: string;
}

export interface SupabaseFarm {
  id: string;
  uuid: string;
  farm_name: string;
  created_at: string;
  updatedAt: string;
}

export interface SupabaseMatriz {
  id: string;
  uuid: string;
  matriz_json: Matriz;
  created_at: string;
  updatedAt: string;
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

  const supabase = getSupabase();

  // Normaliza os dados para garantir estrutura correta
  const normalized = normalizeAnimalData(animal);

  // Remove valores undefined/null que podem causar problemas no Supabase
  let cleanAnimal: Record<string, unknown> = removeUndefinedValues(
    normalized.animal
  ) as Record<string, unknown>;
  const cleanPai: Record<string, unknown> = removeUndefinedValues(
    normalized.pai
  ) as Record<string, unknown>;
  const cleanMae: Record<string, unknown> = removeUndefinedValues(
    normalized.mae
  ) as Record<string, unknown>;
  const cleanAvoMaterno: Record<string, unknown> = removeUndefinedValues(
    normalized.avoMaterno
  ) as Record<string, unknown>;

  // Garante que animal_json sempre tenha pelo menos um campo (obrigatório)
  // Se animal_json estiver vazio, adiciona um campo mínimo
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
      rgn: normalized.animal.rgn || "",
      updatedAt: normalized.updatedAt || new Date().toISOString(),
    };
  }

  // Prepara o payload - garante que todos os campos JSONB sejam objetos válidos (não arrays, não null)
  const payload: {
    uuid: string;
    animal_json: Record<string, unknown>;
    pai_json: Record<string, unknown>;
    mae_json: Record<string, unknown>;
    avo_materno_json: Record<string, unknown>;
    updated_at: string;
  } = {
    uuid: uuid.trim(),
    animal_json:
      cleanAnimal &&
      typeof cleanAnimal === "object" &&
      !Array.isArray(cleanAnimal)
        ? cleanAnimal
        : {},
    pai_json:
      cleanPai &&
      typeof cleanPai === "object" &&
      !Array.isArray(cleanPai) &&
      Object.keys(cleanPai).length > 0
        ? cleanPai
        : {},
    mae_json:
      cleanMae &&
      typeof cleanMae === "object" &&
      !Array.isArray(cleanMae) &&
      Object.keys(cleanMae).length > 0
        ? cleanMae
        : {},
    avo_materno_json:
      cleanAvoMaterno &&
      typeof cleanAvoMaterno === "object" &&
      !Array.isArray(cleanAvoMaterno) &&
      Object.keys(cleanAvoMaterno).length > 0
        ? cleanAvoMaterno
        : {},
    updated_at: normalized.updatedAt || new Date().toISOString(),
  };

  // Validação antes de enviar
  if (
    !payload.animal_json ||
    typeof payload.animal_json !== "object" ||
    Array.isArray(payload.animal_json)
  ) {
    throw new Error(
      `animal_json deve ser um objeto válido. Recebido: ${typeof payload.animal_json}`
    );
  }

  // Log do payload para debug (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log("📤 Payload para Supabase:", {
      uuid: payload.uuid,
      animal_json_keys: Object.keys(payload.animal_json),
      animal_json_sample: JSON.stringify(payload.animal_json).substring(0, 200),
    });
  }

  try {
    const { data, error } = await supabase
      .from("animal_data")
      .upsert(payload, {
        onConflict: "uuid",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      // Log detalhado do erro
      console.error("Erro ao sincronizar animal no Supabase:", {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        uuid,
        payload: JSON.stringify(payload, null, 2),
      });

      // Tenta fornecer uma mensagem mais útil
      const errorMessage = error.message || "Erro desconhecido ao sincronizar";
      const errorDetails = error.details ? ` Detalhes: ${error.details}` : "";
      const errorHint = error.hint ? ` Dica: ${error.hint}` : "";

      throw new Error(
        `Erro ao sincronizar animal: ${errorMessage}${errorDetails}${errorHint}`
      );
    }

    if (!data) {
      throw new Error("Nenhum dado retornado do Supabase após upsert");
    }

    return data.id;
  } catch (error) {
    // Se já é um Error, apenas relança
    if (error instanceof Error) {
      throw error;
    }

    // Caso contrário, cria um novo Error
    console.error("Erro inesperado ao sincronizar animal:", error);
    throw new Error(`Erro inesperado: ${JSON.stringify(error)}`);
  }
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

export async function deleteAnimalDataFromSupabase(
  uuid: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis de ambiente."
    );
  }

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("farm_name", { ascending: true });

    if (error) {
      // Log detalhado do erro
      console.error("Erro ao buscar fazendas do Supabase:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: JSON.stringify(error, null, 2),
      });

      // Se a tabela não existe (código 42P01) ou problema de permissão (código 42501), retorna array vazio
      if (error.code === "42P01" || error.code === "42501") {
        console.warn(
          `Tabela 'farms' não existe ou sem permissão (código: ${error.code}). Retornando array vazio. Verifique se a tabela foi criada no Supabase.`
        );
        return [];
      }

      throw error;
    }

    return data || [];
  } catch (error) {
    // Se já é um Error, apenas relança
    if (error instanceof Error) {
      throw error;
    }

    // Caso contrário, cria um novo Error com mais informações
    console.error("Erro inesperado ao buscar fazendas do Supabase:", error);
    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Erro desconhecido ao buscar fazendas";
    throw new Error(`Erro ao buscar fazendas: ${errorMessage}`);
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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

  const supabase = getSupabase();
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
