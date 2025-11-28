export async function resetIndexedDB(dbName: string) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(dbName);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(false);
    req.onblocked = () => {
      console.warn("IndexedDB reset blocked — close other tabs");
    };
  });
}
