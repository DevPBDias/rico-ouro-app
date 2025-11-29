/**
 * Manual Database Cleanup Utility
 * Use this when RxDB gets stuck in DB9 error loop
 */

/**
 * Clears all RxDB databases and reloads the page
 */
export async function forceCleanDatabase() {
  console.log("🧹 Starting manual database cleanup...");

  try {
    // Clear session storage (reset counters)
    sessionStorage.clear();
    console.log("✅ Session storage cleared");

    // Get all IndexedDB databases
    const databases = await indexedDB.databases();
    console.log(`📦 Found ${databases.length} databases:`, databases);

    // Delete all RxDB databases (those starting with "indi_ouro_db")
    for (const db of databases) {
      if (db.name && db.name.startsWith("indi_ouro_db")) {
        console.log(`🗑️ Deleting database: ${db.name}`);
        indexedDB.deleteDatabase(db.name);
      }
    }

    console.log("✅ All RxDB databases deleted");
    console.log("🔄 Reloading page in 2 seconds...");

    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    alert(
      "Erro ao limpar banco de dados.\n\n" +
        "Por favor, use o método manual:\n" +
        "DevTools (F12) → Application → Storage → Clear site data"
    );
  }
}

/**
 * Clears only a specific database version
 */
export async function deleteSpecificDatabase(dbName: string) {
  console.log(`🗑️ Deleting database: ${dbName}`);
  
  try {
    indexedDB.deleteDatabase(dbName);
    console.log(`✅ Database ${dbName} deleted`);
    console.log("🔄 Reloading page...");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error(`❌ Error deleting ${dbName}:`, error);
  }
}

/**
 * Lists all IndexedDB databases
 */
export async function listDatabases() {
  try {
    const databases = await indexedDB.databases();
    console.log("📦 IndexedDB Databases:");
    databases.forEach((db, index) => {
      console.log(`  ${index + 1}. ${db.name} (v${db.version})`);
    });
    return databases;
  } catch (error) {
    console.error("❌ Error listing databases:", error);
    return [];
  }
}

// Make functions available globally in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).rxdbCleanup = {
    forceClean: forceCleanDatabase,
    deleteDb: deleteSpecificDatabase,
    listDbs: listDatabases,
  };

  console.log(
    "🛠️ RxDB Cleanup utilities available:\n" +
      "  - window.rxdbCleanup.forceClean() - Delete all RxDB databases\n" +
      "  - window.rxdbCleanup.deleteDb('db_name') - Delete specific database\n" +
      "  - window.rxdbCleanup.listDbs() - List all databases"
  );
}
