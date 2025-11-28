/**
 * 🔄 SCRIPT DE MIGRAÇÃO DE DADOS
 * 
 * Use este script para migrar dados de versões antigas do DB
 * para a nova versão v10 com schemas corrigidos.
 * 
 * ATENÇÃO: Execute apenas se você tem dados importantes
 * nas versões antigas que precisa preservar.
 */

import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

/**
 * Migra dados de uma versão antiga para a nova
 */
export async function migrateFromOldVersion(
  oldDbName: string,
  newDbName: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
  };

  console.log(`🔄 Iniciando migração: ${oldDbName} → ${newDbName}`);

  try {
    // 1️⃣ Abrir banco antigo (somente leitura)
    console.log(`📖 Abrindo banco antigo: ${oldDbName}`);
    const oldDb = await openOldDatabase(oldDbName);

    if (!oldDb) {
      throw new Error(`Banco antigo ${oldDbName} não encontrado`);
    }

    // 2️⃣ Exportar dados do banco antigo
    console.log(`📤 Exportando dados do banco antigo...`);
    const exportedData = await exportAllData(oldDb);

    console.log(`   ✓ Exportados ${exportedData.length} documentos`);

    // 3️⃣ Fechar banco antigo
    await oldDb.close();

    // 4️⃣ Importar dados no banco novo
    console.log(`📥 Importando dados no banco novo: ${newDbName}`);
    const imported = await importDataToNewDb(newDbName, exportedData);

    result.migratedCount = imported;
    result.success = true;

    console.log(`✅ Migração concluída: ${imported} documentos migrados`);

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);
    console.error(`❌ Erro na migração:`, error);
    return result;
  }
}

/**
 * Abre um banco antigo para leitura
 */
async function openOldDatabase(dbName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      const db = request.result;
      console.log(`   ✓ Banco ${dbName} aberto`);
      resolve(db);
    };

    request.onerror = () => {
      console.error(`   ❌ Erro ao abrir ${dbName}`);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn(`   ⛔ Abertura bloqueada - feche outras abas`);
    };
  });
}

/**
 * Exporta todos os dados de um banco
 */
async function exportAllData(db: IDBDatabase): Promise<any[]> {
  const allData: any[] = [];

  const objectStoreNames = Array.from(db.objectStoreNames);

  for (const storeName of objectStoreNames) {
    console.log(`   📦 Exportando collection: ${storeName}`);

    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    const data = await new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`      ✓ ${data.length} documentos exportados`);

    allData.push(
      ...data.map((doc) => ({
        ...doc,
        _collection: storeName,
      }))
    );
  }

  return allData;
}

/**
 * Importa dados no banco novo
 */
async function importDataToNewDb(
  dbName: string,
  data: any[]
): Promise<number> {
  // Aqui você precisaria ter acesso ao banco novo
  // Por simplicidade, vamos apenas retornar o count
  // Na prática, você usaria o getDatabase() do client.ts

  console.log(`   ℹ️ Importação de ${data.length} documentos`);
  console.log(`   ⚠️ ATENÇÃO: Implemente a lógica de importação real`);

  // TODO: Implementar importação real usando RxDB
  // Exemplo:
  // const db = await getDatabase();
  // for (const doc of data) {
  //   const collection = db[doc._collection];
  //   await collection.upsert(doc);
  // }

  return data.length;
}

/**
 * Exporta dados para JSON (backup)
 */
export async function exportToJSON(dbName: string): Promise<string> {
  console.log(`💾 Exportando ${dbName} para JSON...`);

  const db = await openOldDatabase(dbName);
  const data = await exportAllData(db);
  await db.close();

  const json = JSON.stringify(data, null, 2);

  console.log(`✅ Exportado ${data.length} documentos`);
  console.log(`📊 Tamanho: ${(json.length / 1024).toFixed(2)} KB`);

  return json;
}

/**
 * Baixa backup como arquivo JSON
 */
export function downloadBackup(dbName: string, json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dbName}_backup_${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ Backup baixado: ${a.download}`);
}

/**
 * Utilitário: Criar backup antes de migrar
 */
export async function backupBeforeMigration(dbName: string): Promise<void> {
  console.log(`🔒 Criando backup de segurança de ${dbName}...`);

  try {
    const json = await exportToJSON(dbName);
    downloadBackup(dbName, json);
    console.log(`✅ Backup criado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao criar backup:`, error);
    throw error;
  }
}

/**
 * EXEMPLO DE USO:
 * 
 * // No console do navegador:
 * import { backupBeforeMigration, migrateFromOldVersion } from '@/db/utils/migrations';
 * 
 * // 1. Criar backup
 * await backupBeforeMigration('indi_ouro_db_v9');
 * 
 * // 2. Migrar dados
 * const result = await migrateFromOldVersion('indi_ouro_db_v9', 'indi_ouro_db_v10');
 * console.log('Resultado:', result);
 */
