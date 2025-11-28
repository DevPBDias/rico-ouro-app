/**
 * 🔥 RESET ROBUSTO DO INDEXEDDB
 *
 * Este utilitário garante a remoção completa de um banco IndexedDB,
 * incluindo tratamento de bloqueios, limpeza de cache e fallbacks.
 */

export interface ResetOptions {
  /** Nome do banco a ser removido */
  dbName: string;
  /** Tempo máximo de espera em ms (padrão: 10000) */
  timeout?: number;
  /** Se deve limpar localStorage relacionado */
  clearLocalStorage?: boolean;
  /** Se deve limpar sessionStorage relacionado */
  clearSessionStorage?: boolean;
  /** Se deve invalidar cache do Service Worker */
  invalidateSWCache?: boolean;
}

export interface ResetResult {
  success: boolean;
  message: string;
  clearedStorage: boolean;
  clearedSWCache: boolean;
}

/**
 * Remove um banco IndexedDB de forma robusta
 */
export async function resetIndexedDB(
  dbNameOrOptions: string | ResetOptions
): Promise<ResetResult> {
  const options: ResetOptions =
    typeof dbNameOrOptions === "string"
      ? { dbName: dbNameOrOptions }
      : dbNameOrOptions;

  const {
    dbName,
    timeout = 10000,
    clearLocalStorage = true,
    clearSessionStorage = true,
    invalidateSWCache = true,
  } = options;

  console.log(`🗑️ Iniciando reset robusto do IndexedDB: ${dbName}`);

  const result: ResetResult = {
    success: false,
    message: "",
    clearedStorage: false,
    clearedSWCache: false,
  };

  try {
    // 1️⃣ Fechar todas as conexões abertas
    await closeAllConnections(dbName);

    // 2️⃣ Tentar deletar o banco com timeout
    const deleted = await deleteDatabase(dbName, timeout);

    if (!deleted) {
      throw new Error(`Timeout ao deletar ${dbName} após ${timeout}ms`);
    }

    // 3️⃣ Limpar localStorage se solicitado
    if (clearLocalStorage) {
      clearStorageByPrefix(localStorage, dbName);
      result.clearedStorage = true;
    }

    // 4️⃣ Limpar sessionStorage se solicitado
    if (clearSessionStorage) {
      clearStorageByPrefix(sessionStorage, dbName);
    }

    // 5️⃣ Invalidar cache do Service Worker se solicitado
    if (invalidateSWCache && "caches" in window) {
      await invalidateServiceWorkerCache();
      result.clearedSWCache = true;
    }

    result.success = true;
    result.message = `✅ Banco ${dbName} removido com sucesso`;
    console.log(result.message);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.success = false;
    result.message = `❌ Erro ao resetar ${dbName}: ${errorMessage}`;
    console.error(result.message, error);

    // Tentar fallback: limpar tudo manualmente
    await fallbackCleanup(dbName);

    return result;
  }
}

/**
 * Fecha todas as conexões abertas do banco
 */
async function closeAllConnections(dbName: string): Promise<void> {
  console.log(`🔌 Fechando conexões abertas de ${dbName}...`);

  // Não há API direta para fechar conexões de outros contextos,
  // mas podemos tentar abrir e fechar imediatamente
  return new Promise((resolve) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      const db = request.result;
      db.close();
      console.log(`   ✓ Conexão fechada`);
      resolve();
    };

    request.onerror = () => {
      console.warn(`   ⚠️ Não foi possível abrir ${dbName} para fechar`);
      resolve();
    };

    request.onblocked = () => {
      console.warn(`   ⛔ Abertura bloqueada - outras abas podem estar usando`);
      resolve();
    };
  });
}

/**
 * Deleta o banco com timeout
 */
function deleteDatabase(dbName: string, timeout: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    console.log(`🗑️ Deletando banco ${dbName}...`);

    const request = indexedDB.deleteDatabase(dbName);
    let timeoutId: NodeJS.Timeout | null = null;
    let resolved = false;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      resolved = true;
    };

    // Timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        cleanup();
        console.warn(`   ⏱️ Timeout ao deletar ${dbName}`);
        reject(new Error(`Timeout ao deletar ${dbName}`));
      }
    }, timeout);

    request.onsuccess = () => {
      if (!resolved) {
        cleanup();
        console.log(`   ✅ Banco ${dbName} deletado com sucesso`);
        resolve(true);
      }
    };

    request.onerror = () => {
      if (!resolved) {
        cleanup();
        const error = request.error?.message || "Erro desconhecido";
        console.error(`   ❌ Erro ao deletar ${dbName}:`, error);
        reject(new Error(error));
      }
    };

    request.onblocked = () => {
      console.warn(
        `   ⛔ Deleção bloqueada - feche outras abas usando ${dbName}`
      );
      // Não rejeitamos aqui, aguardamos o timeout ou sucesso
    };
  });
}

/**
 * Limpa chaves do storage que começam com o prefixo
 */
function clearStorageByPrefix(storage: Storage, prefix: string): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.includes(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    storage.removeItem(key);
    console.log(`   🗑️ Removido do storage: ${key}`);
  });

  if (keysToRemove.length > 0) {
    console.log(`   ✓ ${keysToRemove.length} chaves removidas do storage`);
  }
}

/**
 * Invalida cache do Service Worker
 */
async function invalidateServiceWorkerCache(): Promise<void> {
  console.log(`🔄 Invalidando cache do Service Worker...`);

  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map((cacheName) => {
      console.log(`   🗑️ Removendo cache: ${cacheName}`);
      return caches.delete(cacheName);
    });

    await Promise.all(deletePromises);
    console.log(`   ✅ Cache do Service Worker invalidado`);
  } catch (error) {
    console.warn(`   ⚠️ Erro ao invalidar cache do SW:`, error);
  }
}

/**
 * Fallback: tenta limpar tudo manualmente
 */
async function fallbackCleanup(dbName: string): Promise<void> {
  console.warn(`🆘 Executando limpeza de fallback para ${dbName}...`);

  // Limpar storages
  clearStorageByPrefix(localStorage, dbName);
  clearStorageByPrefix(sessionStorage, dbName);

  // Tentar invalidar cache
  if ("caches" in window) {
    await invalidateServiceWorkerCache();
  }

  // Tentar deletar novamente sem timeout
  try {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn(`   ⛔ Ainda bloqueado no fallback`);
        // Resolve mesmo assim
        resolve();
      };
    });
    console.log(`   ✅ Fallback: banco deletado`);
  } catch (error) {
    console.error(`   ❌ Fallback: falha ao deletar banco`, error);
  }
}

/**
 * Lista todos os bancos IndexedDB (se suportado)
 */
export async function listDatabases(): Promise<string[]> {
  if (!indexedDB.databases) {
    console.warn("⚠️ indexedDB.databases() não suportado neste navegador");
    return [];
  }

  try {
    const dbs = await indexedDB.databases();
    return dbs.map((db) => db.name || "").filter(Boolean);
  } catch (error) {
    console.error("❌ Erro ao listar bancos:", error);
    return [];
  }
}

/**
 * Remove TODOS os bancos IndexedDB (use com cuidado!)
 */
export async function resetAllDatabases(): Promise<ResetResult[]> {
  console.warn("🔥 RESETANDO TODOS OS BANCOS INDEXEDDB!");

  const dbNames = await listDatabases();

  if (dbNames.length === 0) {
    console.log("ℹ️ Nenhum banco encontrado");
    return [];
  }

  console.log(`📦 Encontrados ${dbNames.length} bancos:`, dbNames);

  const results = await Promise.all(
    dbNames.map((dbName) =>
      resetIndexedDB({
        dbName,
        clearLocalStorage: true,
        clearSessionStorage: true,
        invalidateSWCache: true,
      })
    )
  );

  return results;
}
