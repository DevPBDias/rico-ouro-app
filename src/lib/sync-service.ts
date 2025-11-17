import {
  getSyncQueue,
  removeFromSyncQueue,
  markAsSynced,
  updateAnimalData,
  updateVaccine,
  updateFarm,
  saveDatabase,
  getAnimalDataByUuid,
  getVaccineByUuid,
  getFarmByUuid,
  addAnimalData,
  addVaccine,
  addFarm,
  addMatriz,
  getMatrizByUuid,
  updateMatriz,
} from "./sqlite-db";
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
import { AnimalData, Vaccine, Farm, Matriz } from "./db";
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
      await saveDatabase();
    }
  }

  // Sincroniza dados locais → remoto
  private async syncLocalToRemote(): Promise<void> {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return;
    }

    console.log(`📤 Sincronizando ${queue.length} item(ns) da fila...`);

    for (const item of queue) {
      try {
        if (item.table_name === "animal_data") {
          await this.syncAnimalItem(item);
        } else if (item.table_name === "vaccines") {
          await this.syncVaccineItem(item);
        } else if (item.table_name === "farms") {
          await this.syncFarmItem(item);
        } else if (item.table_name === "matrizes") {
          await this.syncMatrizItem(item);
        } else {
          console.warn(`⚠️ Tipo de tabela desconhecido: ${item.table_name}`);
          // Remove da fila mesmo assim para evitar loop infinito
          await removeFromSyncQueue(item.id);
          continue;
        }

        // Remove da fila após sucesso
        await removeFromSyncQueue(item.id);
        console.log(`✅ Item ${item.id} sincronizado e removido da fila`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Erro ao sincronizar item ${item.id} (${item.table_name}):`,
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
          await removeFromSyncQueue(item.id);
        }
        // Caso contrário, mantém na fila para tentar novamente depois
      }
    }
  }

  // Sincroniza item de animal
  private async syncAnimalItem(item: {
    operation: string;
    uuid: string | null;
    data_json: string | null;
  }): Promise<void> {
    if (!item.uuid) {
      console.warn("⚠️ Item de sincronização sem UUID, pulando:", item);
      return;
    }

    try {
      if (item.operation === "DELETE") {
        await deleteAnimalDataFromSupabase(item.uuid);
        console.log(`✅ Animal deletado no Supabase: ${item.uuid}`);
      } else if (item.data_json) {
        try {
          const animal: AnimalData = JSON.parse(item.data_json);

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
        console.warn("⚠️ Item de sincronização sem dados JSON, pulando:", item);
      }
    } catch (error) {
      console.error(`❌ Erro ao sincronizar animal ${item.uuid}:`, error);
      // Relança o erro para que seja tratado pelo chamador
      throw error;
    }
  }

  // Sincroniza item de vacina
  private async syncVaccineItem(item: {
    operation: string;
    uuid: string | null;
    data_json: string | null;
  }): Promise<void> {
    if (!item.uuid) return;

    if (item.operation === "DELETE") {
      await deleteVaccineFromSupabase(item.uuid);
    } else if (item.data_json) {
      const vaccine: Vaccine = JSON.parse(item.data_json);
      await syncVaccineToSupabase(vaccine, item.uuid);
    }
  }

  // Sincroniza item de matriz
  private async syncMatrizItem(item: {
    operation: string;
    uuid: string | null;
    data_json: string | null;
  }): Promise<void> {
    if (!item.uuid) return;

    if (item.operation === "DELETE") {
      await deleteMatrizFromSupabase(item.uuid);
    } else if (item.data_json) {
      const matriz = JSON.parse(item.data_json) as Matriz;
      await syncMatrizToSupabase(matriz, item.uuid);
    }
  }

  // Sincroniza item de fazenda
  private async syncFarmItem(item: {
    operation: string;
    uuid: string | null;
    data_json: string | null;
  }): Promise<void> {
    if (!item.uuid) return;

    if (item.operation === "DELETE") {
      await deleteFarmFromSupabase(item.uuid);
    } else if (item.data_json) {
      const farm: Farm = JSON.parse(item.data_json);
      await syncFarmToSupabase(farm, item.uuid);
    }
  }

  // Sincroniza dados remoto → local
  private async syncRemoteToLocal(): Promise<void> {
    try {
      // Sincroniza animais
      await this.syncAnimalsRemoteToLocal();

      // Sincroniza vacinas
      await this.syncVaccinesRemoteToLocal();

      // Sincroniza fazendas
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
        // Verifica se existe localmente pelo UUID (mais confiável)
        const localByUuid = await getAnimalDataByUuid(remote.uuid);

        // Converte SupabaseAnimalData para AnimalData
        // Usa normalizeAnimalData para garantir estrutura correta
        const animal: AnimalData = normalizeAnimalData({
          animal: {
            ...remote.animal_json,
            updatedAt: remote.updated_at,
          },
          pai: remote.pai_json || {},
          mae: remote.mae_json || {},
          avoMaterno: remote.avo_materno_json || {},
        });

        if (!localByUuid) {
          // Não existe localmente, adiciona com UUID do Supabase (já sincronizado)
          await addAnimalData(animal, remote.uuid);
        } else {
          // Existe localmente, compara timestamps
          const remoteTime = new Date(remote.updated_at).getTime();
          const localTime = localByUuid.animal?.updatedAt
            ? new Date(localByUuid.animal.updatedAt).getTime()
            : 0;

          // Se remoto é mais recente, atualiza local e marca como sincronizado
          if (remoteTime >= localTime && localByUuid.id) {
            await updateAnimalData(localByUuid.id, animal);
            // Marca como sincronizado após atualizar (remove da fila se existir)
            await markAsSynced("animal_data", localByUuid.id, remote.uuid);
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
        // Verifica se existe localmente pelo UUID
        const localByUuid = await getVaccineByUuid(remote.uuid);

        const vaccine: Vaccine = {
          vaccineName: remote.vaccine_name,
        };

        if (!localByUuid) {
          // Não existe localmente, adiciona com UUID do Supabase (já sincronizado)
          await addVaccine(vaccine, remote.uuid);
        } else {
          // Existe localmente, atualiza e marca como sincronizado
          if (localByUuid.id) {
            await updateVaccine(localByUuid.id, vaccine);
            // Marca como sincronizado após atualizar (remove da fila se existir)
            await markAsSynced("vaccines", localByUuid.id, remote.uuid);
          }
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
          const localByUuid = await getFarmByUuid(remote.uuid);

          const farm: Farm = {
            farmName: remote.farm_name,
          };

          if (!localByUuid) {
            await addFarm(farm, remote.uuid);
          } else if (localByUuid.id) {
            await updateFarm(localByUuid.id, farm);
            await markAsSynced("farms", localByUuid.id, remote.uuid);
          }
        } catch (error) {
          console.error(`Erro ao sincronizar fazenda ${remote.uuid}:`, error);
        }
      }
    } catch (error) {
      // Se houver erro ao buscar fazendas (ex: tabela não existe), apenas loga e continua
      console.warn(
        "Erro ao buscar fazendas do Supabase para sincronização:",
        error
      );
      // Não relança o erro para não interromper a sincronização de outras tabelas
    }
  }

  // Sincroniza matrizes remoto → local
  private async syncMatrizesRemoteToLocal(): Promise<void> {
    try {
      const remoteMatrizes = await fetchMatrizesFromSupabase();

      for (const remote of remoteMatrizes) {
        try {
          const localByUuid = await getMatrizByUuid(remote.uuid);

          const matrizObj = remote.matriz_json as Matriz;

          if (!localByUuid) {
            // Não existe localmente, adiciona com UUID do Supabase
            await addMatriz(matrizObj, remote.uuid);
          } else {
            // Existe localmente, compara timestamps
            const remoteTime = new Date(remote.updated_at).getTime();
            // Tentativa defensiva de extrair timestamp local (suporta `updatedAt` ou `updated_at`)
            // Extract updated timestamp defensively; prefer `updatedAt`, fall back to `updated_at`.
            let localUpdatedAt: string | null = null;
            if (localByUuid.matriz) {
              const matRecord = localByUuid.matriz as unknown as Record<
                string,
                unknown
              >;
              const v1 = matRecord["updatedAt"];
              if (typeof v1 === "string") {
                localUpdatedAt = v1;
              } else {
                const v2 = matRecord["updated_at"];
                if (typeof v2 === "string") {
                  localUpdatedAt = v2;
                }
              }
            }
            const localTime = localUpdatedAt
              ? new Date(localUpdatedAt as string).getTime()
              : 0;

            if (remoteTime >= localTime && localByUuid.id) {
              await updateMatriz(localByUuid.id, matrizObj);
              await markAsSynced("matrizes", localByUuid.id, remote.uuid);
            }
          }
        } catch (error) {
          console.error(`Erro ao sincronizar matriz ${remote.uuid}:`, error);
        }
      }
    } catch (error) {
      console.warn(
        "Erro ao buscar matrizes do Supabase para sincronização:",
        error
      );
    }
  }

  // Força sincronização manual
  async forceSync(): Promise<void> {
    await this.sync();
  }
}

// Instância singleton
export const syncService = new SyncService();

// NOTA: A sincronização automática será iniciada pelo componente SyncManager
// Isso garante que o componente React esteja montado antes de iniciar a sincronização
