import { db } from "./dexie";
import {
  syncAnimalDataToSupabase,
  deleteAnimalDataFromSupabase,
  fetchAnimalDataFromSupabase,
  syncVaccineToSupabase,
  deleteVaccineFromSupabase,
  fetchVaccinesFromSupabase,
  syncFarmToSupabase,
  deleteFarmFromSupabase,
  fetchFarmsFromSupabase,
  syncMatrizToSupabase,
  deleteMatrizFromSupabase,
  fetchMatrizesFromSupabase,
  isOnline,
  onOnlineStatusChange,
} from "./supabase-client";
import { AnimalData, Vaccine, Farm, Matriz, SyncQueueItem } from "./dexie";
import { normalizeAnimalData } from "./db-helpers";

class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private onlineStatusUnsubscribe: (() => void) | null = null;

  constructor() {
    this.setupOnlineListener();
  }

  // Configura listener de conectividade
  private setupOnlineListener() {
    if (typeof window === "undefined") return;

    this.onlineStatusUnsubscribe = onOnlineStatusChange((online) => {
      if (online) {
        console.log("🟢 Online - Iniciando sincronização...");
        this.sync();
      } else {
        console.log("🔴 Offline - Sincronização pausada");
      }
    });
  }

  // Inicia sincronização automática
  startAutoSync(intervalMs: number = 3000000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (isOnline() && !this.isSyncing) {
        this.sync();
      }
    }, intervalMs);

    // Sincroniza imediatamente se online
    if (isOnline()) {
      this.sync();
    }
  }

  // Para sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.onlineStatusUnsubscribe) {
      this.onlineStatusUnsubscribe();
      this.onlineStatusUnsubscribe = null;
    }
  }

  // Sincroniza dados locais com Supabase
  async sync(): Promise<void> {
    // Verifica se Supabase está configurado
    const { isSupabaseConfigured } = await import("./supabase-client");
    if (!isSupabaseConfigured()) {
      console.warn("⚠️ Supabase não configurado. Sincronização desabilitada.");
      return;
    }

    if (!isOnline() || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    console.log("🔄 Iniciando sincronização...");

    try {
      // 1. Envia mudanças locais para Supabase
      await this.syncLocalToRemote();

      // 2. Baixa mudanças do Supabase para local
      await this.syncRemoteToLocal();

      console.log("✅ Sincronização concluída");

      // Emite evento de sucesso
      if (typeof window !== "undefined") {
        const { emitSyncEvent } = await import("@/hooks/useSyncNotifications");
        emitSyncEvent(
          "success",
          "Banco de dados sincronizado com Supabase com sucesso!"
        );
      }
    } catch (error) {
      console.error("❌ Erro na sincronização:", error);

      // Emite evento de erro
      if (typeof window !== "undefined") {
        const { emitSyncEvent } = await import("@/hooks/useSyncNotifications");
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao sincronizar com Supabase";
        emitSyncEvent("error", errorMessage);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  // Sincroniza dados locais → remoto
  private async syncLocalToRemote(): Promise<void> {
    const queue = await db.syncQueue.toArray();

    if (queue.length === 0) {
      return;
    }

    console.log(`📤 Sincronizando ${queue.length} item(ns) da fila...`);

    for (const item of queue) {
      try {
        const table = item.table ?? (item as unknown as { table_name?: string }).table_name;
        const t = typeof table === "string" ? table.toLowerCase() : table;
        if (t === "animal_data" || t === "animals") {
          await this.syncAnimalItem(item);
        } else if (t === "vaccines") {
          await this.syncVaccineItem(item);
        } else if (t === "farms") {
          await this.syncFarmItem(item);
        } else if (t === "matrizes" || t === "matrices") {
          await this.syncMatrizItem(item);
        } else {
          console.warn(`⚠️ Tipo de tabela desconhecido: ${table}`);
          await db.syncQueue.delete(item.id);
          continue;
        }

        await db.syncQueue.delete(item.id);
        console.log(`✅ Item ${item.id} sincronizado e removido da fila`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Erro ao sincronizar item ${item.id} (${item.table}):`,
          errorMessage
        );

        // Se for um erro de configuração ou de validação, remove da fila para evitar loop
        if (
          errorMessage.includes("não está configurado") ||
          errorMessage.includes("inválido") ||
          errorMessage.includes("UUID é obrigatório")
        ) {
          console.warn(
            `⚠️ Removendo item ${item.id} da fila devido a erro não recuperável`
          );
          await db.syncQueue.delete(item.id);
        }
        // Caso contrário, mantém na fila para tentar novamente depois
      }
    }
  }

  // Sincroniza item de animal
  private async syncAnimalItem(item: SyncQueueItem): Promise<void> {
    if (!item.uuid) {
      console.warn("⚠️ Item de sincronização sem UUID, pulando:", item);
      return;
    }

    try {
      const op = (item.operation || "").toLowerCase();
      if (op === "delete") {
        await deleteAnimalDataFromSupabase(item.uuid);
        console.log(`✅ Animal deletado no Supabase: ${item.uuid}`);
      } else if (item.payload) {
        try {
          const animal: AnimalData =
            typeof item.payload === "string"
              ? JSON.parse(item.payload)
              : (item.payload as AnimalData);

          // Validação básica
          if (!animal || !animal.animal) {
            throw new Error("Dados do animal inválidos ou incompletos");
          }

          await syncAnimalDataToSupabase(animal, item.uuid);
          console.log(`✅ Animal sincronizado no Supabase: ${item.uuid}`);
        } catch (parseError) {
          console.error(
            `❌ Erro ao fazer parse dos dados do animal ${item.uuid}:`,
            parseError
          );
          throw new Error(
            `Erro ao processar dados: ${
              parseError instanceof Error
                ? parseError.message
                : "Erro desconhecido"
            }`
          );
        }
      } else {
        console.warn("⚠️ Item de sincronização sem payload, pulando:", item);
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar animal ${item.uuid}:`, error);
      // Relança o erro para que seja tratado pelo chamador
      throw error;
    }
  }

  // Sincroniza item de vacina
  private async syncVaccineItem(item: SyncQueueItem): Promise<void> {
    if (!item.uuid) return;

    const op = (item.operation || "").toLowerCase();
    if (op === "delete") {
      await deleteVaccineFromSupabase(item.uuid);
    } else if (item.payload) {
      const vaccine: Vaccine =
        typeof item.payload === "string" ? JSON.parse(item.payload) : (item.payload as Vaccine);
      await syncVaccineToSupabase(vaccine, item.uuid);
    }
  }

  // Sincroniza item de matriz
  private async syncMatrizItem(item: SyncQueueItem): Promise<void> {
    if (!item.uuid) return;

    const op = (item.operation || "").toLowerCase();
    if (op === "delete") {
      await deleteMatrizFromSupabase(item.uuid);
    } else if (item.payload) {
      const matriz: Matriz =
        typeof item.payload === "string" ? JSON.parse(item.payload) : (item.payload as Matriz);
      await syncMatrizToSupabase(matriz, item.uuid);
    }
  }

  // Sincroniza item de fazenda
  private async syncFarmItem(item: SyncQueueItem): Promise<void> {
    if (!item.uuid) return;

    const op = (item.operation || "").toLowerCase();
    if (op === "delete") {
      await deleteFarmFromSupabase(item.uuid);
    } else if (item.payload) {
      const farm: Farm =
        typeof item.payload === "string" ? JSON.parse(item.payload) : (item.payload as Farm);
      await syncFarmToSupabase(farm, item.uuid);
    }
  }

  // Sincroniza dados remoto → local
  private async syncRemoteToLocal(): Promise<void> {
    try {
      await this.syncAnimalsRemoteToLocal();
      await this.syncVaccinesRemoteToLocal();
      await this.syncFarmsRemoteToLocal();

      // Sincroniza matrizes
      await this.syncMatrizesRemoteToLocal();
    } catch (error) {
      console.error("Erro ao sincronizar remoto → local:", error);
    }
  }

  // Sincroniza animais remoto → local
  private async syncAnimalsRemoteToLocal(): Promise<void> {
    const remoteAnimals = await fetchAnimalDataFromSupabase();

    for (const remote of remoteAnimals) {
      try {
        const localByUuid = await db.animals.where("uuid").equals(remote.uuid).first();

        const rawAnimal: AnimalData = normalizeAnimalData({
          animal: { ...remote.animal_json, updatedAt: remote.updated_at },
          pai: remote.pai_json || {},
          mae: remote.mae_json || {},
          avoMaterno: remote.avo_materno_json || {},
        });
        const animalNoId: AnimalData = { ...rawAnimal, id: undefined };
        const animalWithUuid: AnimalData = { ...animalNoId, uuid: remote.uuid, updatedAt: remote.updated_at };

        if (!localByUuid) {
          const byComposite = await db.animals
            .where("[animal.serieRGD+animal.rgn]")
            .equals([animalWithUuid.animal.serieRGD || "", animalWithUuid.animal.rgn || ""]) 
            .first();
          if (byComposite && byComposite.id !== undefined) {
            await db.animals.update(byComposite.id as number, animalWithUuid);
          } else {
            await db.animals.add(animalWithUuid);
          }
        } else {
          const remoteTime = new Date(remote.updated_at).getTime();
          const localTime = localByUuid.animal?.updatedAt
            ? new Date(localByUuid.animal.updatedAt).getTime()
            : 0;

          if (remoteTime >= localTime && localByUuid.id !== undefined) {
            await db.animals.update(localByUuid.id as number, animalWithUuid);
          }
        }
      } catch (error) {
        console.error(`Erro ao sincronizar animal ${remote.uuid}:`, error);
      }
    }
  }

  // Sincroniza vacinas remoto → local
  private async syncVaccinesRemoteToLocal(): Promise<void> {
    const remoteVaccines = await fetchVaccinesFromSupabase();

    for (const remote of remoteVaccines) {
      try {
        const localByUuid = await db.vaccines.where("uuid").equals(remote.uuid).first();

        const vaccine: Vaccine = { vaccineName: remote.vaccine_name, uuid: remote.uuid, updatedAt: remote.updated_at };

        if (!localByUuid) {
          await db.vaccines.add(vaccine);
        } else if (localByUuid.id !== undefined) {
          await db.vaccines.update(localByUuid.id as number, vaccine);
        }
      } catch (error) {
        console.error(`Erro ao sincronizar vacina ${remote.uuid}:`, error);
      }
    }
  }

  // Sincroniza fazendas remoto → local
  private async syncFarmsRemoteToLocal(): Promise<void> {
    try {
      const remoteFarms = await fetchFarmsFromSupabase();

      for (const remote of remoteFarms) {
        try {
          const localByUuid = await db.farms.where("uuid").equals(remote.uuid).first();

          const farm: Farm = { farmName: remote.farm_name, uuid: remote.uuid, updatedAt: remote.updated_at };

          if (!localByUuid) {
            await db.farms.add(farm);
          } else if (localByUuid.id !== undefined) {
            await db.farms.update(localByUuid.id as number, farm);
          }
        } catch (error) {
          console.error(`Erro ao sincronizar fazenda ${remote.uuid}:`, error);
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar fazendas do Supabase para sincronização:", error);
    }
  }

  // Sincroniza matrizes remoto → local
  private async syncMatrizesRemoteToLocal(): Promise<void> {
    try {
      const remoteMatrizes = await fetchMatrizesFromSupabase();

      for (const remote of remoteMatrizes) {
        try {
          const localByUuid = await db.matrices.where("uuid").equals(remote.uuid).first();

          const base = remote.matriz_json as Partial<Matriz> & { id?: number };
          const matrizObj: Matriz = {
            ...(base as Matriz),
            id: undefined,
            updatedAt: remote.updated_at,
            uuid: remote.uuid,
          };

          if (!localByUuid) {
            await db.matrices.add(matrizObj);
          } else {
            const remoteTime = new Date(remote.updated_at).getTime();
            const localUpdatedAt = (localByUuid as { updatedAt?: string; updated_at?: string }).updatedAt || (localByUuid as { updatedAt?: string; updated_at?: string }).updated_at || null;
            const localTime = localUpdatedAt ? new Date(localUpdatedAt as string).getTime() : 0;

            if (remoteTime >= localTime && localByUuid.id !== undefined) {
            await db.matrices.update(localByUuid.id as number, matrizObj);
          }
          }
        } catch (error) {
          console.error(`Erro ao sincronizar matriz ${remote.uuid}:`, error);
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar matrizes do Supabase para sincronização:", error);
    }
  }

  async forceSync(): Promise<void> {
    await this.sync();
  }
}

export const syncService = new SyncService();