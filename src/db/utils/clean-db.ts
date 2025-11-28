/**
 * 🧹 Utilitário para limpar completamente o IndexedDB
 * 
 * Use este script APENAS se você estiver com problemas de schema conflict (DB9)
 * e quiser fazer uma limpeza completa do banco de dados local.
 * 
 * ⚠️ ATENÇÃO: Isso apagará TODOS os dados locais!
 */

/**
 * Remove um banco específico do IndexedDB
 */
export async function deleteDatabase(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🗑️ Deletando banco: ${dbName}`);
    
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log(`✅ Banco ${dbName} deletado com sucesso`);
      resolve();
    };
    
    request.onerror = () => {
      console.error(`❌ Erro ao deletar ${dbName}:`, request.error);
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn(`⛔ Deleção bloqueada - feche todas as abas do app`);
    };
  });
}

/**
 * Lista todos os bancos IndexedDB
 */
export async function listAllDatabases(): Promise<string[]> {
  if (!indexedDB.databases) {
    console.warn("⚠️ indexedDB.databases() não suportado neste navegador");
    return [];
  }
  
  const dbs = await indexedDB.databases();
  return dbs.map((db) => db.name || "").filter(Boolean);
}

/**
 * Limpa TODOS os bancos relacionados ao app
 */
export async function cleanAllAppDatabases(): Promise<void> {
  console.log("🧹 Limpando todos os bancos do app...");
  
  const allDbs = await listAllDatabases();
  const appDbs = allDbs.filter(
    (name) =>
      name.includes("indi_ouro") ||
      name.includes("rico_ouro") ||
      name.includes("rxdb")
  );
  
  console.log(`📋 Bancos encontrados: ${appDbs.join(", ")}`);
  
  for (const dbName of appDbs) {
    try {
      await deleteDatabase(dbName);
    } catch (error) {
      console.error(`Erro ao deletar ${dbName}:`, error);
    }
  }
  
  // Limpa localStorage e sessionStorage relacionados
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes("rxdb") || key.includes("indi_ouro"))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido do localStorage: ${key}`);
  });
  
  console.log("✅ Limpeza completa!");
  console.log("🔄 Recarregue a página para recriar o banco");
}

/**
 * EXEMPLO DE USO (no console do navegador):
 * 
 * import { cleanAllAppDatabases } from '@/db/utils/clean-db';
 * await cleanAllAppDatabases();
 * 
 * Depois, recarregue a página (F5)
 */
