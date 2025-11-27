// Script temporário para limpar o banco de dados antigo
// Execute este arquivo uma vez no console do navegador para limpar o IndexedDB

async function clearOldDatabase() {
  console.log("🗑️ Limpando banco de dados antigo...");
  
  try {
    // Lista todos os bancos IndexedDB
    const databases = await indexedDB.databases();
    console.log("Bancos encontrados:", databases);
    
    // Remove o banco rico_ouro_db
    const dbName = "rico_ouro_db";
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    
    deleteRequest.onsuccess = () => {
      console.log(`✅ Banco "${dbName}" removido com sucesso!`);
      console.log("🔄 Recarregue a página para criar um novo banco.");
    };
    
    deleteRequest.onerror = (event) => {
      console.error(`❌ Erro ao remover banco "${dbName}":`, event);
    };
    
    deleteRequest.onblocked = () => {
      console.warn(`⚠️ Remoção do banco "${dbName}" está bloqueada. Feche todas as abas do aplicativo e tente novamente.`);
    };
  } catch (error) {
    console.error("❌ Erro ao limpar banco:", error);
  }
}

clearOldDatabase();
