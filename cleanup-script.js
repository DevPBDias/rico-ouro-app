/**
 * 🧪 Script de Teste e Limpeza
 *
 * Execute este script no console do navegador (F12) para:
 * 1. Limpar completamente o IndexedDB
 * 2. Limpar localStorage e sessionStorage
 * 3. Desregistrar Service Workers
 * 4. Preparar para um teste limpo
 *
 * USO:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este código
 * 3. Aguarde a conclusão
 * 4. Feche TODAS as abas do app
 * 5. Abra uma nova aba e acesse o app
 */

async function cleanEverything() {
  console.log("🧹 Iniciando limpeza completa...\n");

  // 1. Limpar localStorage
  console.log("📦 Limpando localStorage...");
  const localStorageKeys = Object.keys(localStorage);
  console.log(`   Encontradas ${localStorageKeys.length} chaves`);
  localStorage.clear();
  console.log("   ✅ localStorage limpo\n");

  // 2. Limpar sessionStorage
  console.log("📦 Limpando sessionStorage...");
  sessionStorage.clear();
  console.log("   ✅ sessionStorage limpo\n");

  // 3. Listar e deletar todos os bancos IndexedDB
  console.log("💾 Limpando IndexedDB...");

  if (indexedDB.databases) {
    const dbs = await indexedDB.databases();
    console.log(`   Encontrados ${dbs.length} bancos:`);

    for (const db of dbs) {
      if (db.name) {
        console.log(`   🗑️ Deletando: ${db.name}`);
        await new Promise((resolve, reject) => {
          const request = indexedDB.deleteDatabase(db.name);
          request.onsuccess = () => {
            console.log(`      ✅ ${db.name} deletado`);
            resolve(true);
          };
          request.onerror = () => {
            console.error(`      ❌ Erro ao deletar ${db.name}`);
            reject(request.error);
          };
          request.onblocked = () => {
            console.warn(`      ⛔ Deleção bloqueada - feche outras abas`);
          };
        });
      }
    }
  } else {
    console.log("   ⚠️ indexedDB.databases() não suportado");
    console.log("   Tentando deletar bancos conhecidos...");

    const knownDbs = [
      "indi_ouro_db",
      "indi_ouro_db_v14",
      "indi_ouro_db_v13",
      "rico_ouro_db",
    ];

    for (const dbName of knownDbs) {
      try {
        await new Promise((resolve) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => {
            console.log(`      ✅ ${dbName} deletado`);
            resolve(true);
          };
          request.onerror = () => resolve(false);
        });
      } catch {}
    }
  }

  console.log("   ✅ IndexedDB limpo\n");

  // 4. Desregistrar Service Workers
  console.log("🔧 Desregistrando Service Workers...");

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`   Encontrados ${registrations.length} Service Workers`);

    for (const registration of registrations) {
      await registration.unregister();
      console.log(`   ✅ Service Worker desregistrado`);
    }
  }

  console.log("   ✅ Service Workers desregistrados\n");

  // 5. Limpar cache do Service Worker
  console.log("🗄️ Limpando caches...");

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    console.log(`   Encontrados ${cacheNames.length} caches`);

    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log(`   ✅ Cache ${cacheName} deletado`);
    }
  }

  console.log("   ✅ Caches limpos\n");

  console.log("✅ LIMPEZA COMPLETA!\n");
  console.log("📋 Próximos passos:");
  console.log("   1. Feche TODAS as abas deste app");
  console.log("   2. Abra uma nova aba");
  console.log("   3. Acesse o app novamente");
  console.log("   4. Verifique os logs no console\n");
  console.log("🔍 Logs esperados:");
  console.log("   ✅ 🔧 RxDB DevMode ativado");
  console.log("   ✅ 🔵 getDB: Criando nova instância do RxDB...");
  console.log("   ✅ 📦 Adding collections...");
  console.log("   ✅ 🔄 Starting replications...");
  console.log("   ✅ ✅ RxDB initialized");
  console.log("\n❌ NÃO deve aparecer:");
  console.log("   ❌ Multiple GoTrueClient instances detected");
  console.log("   ❌ DB9 - schema mismatch");
  console.log("   ❌ Schema conflict detected");
}

// Executar automaticamente
cleanEverything().catch(console.error);
