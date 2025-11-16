import type { Database, SqlJsStatic } from "sql.js";
import { AnimalData, Vaccine, Farm, Matriz } from "./db";
import {
  serializeAnimalData,
  deserializeAnimalData,
  normalizeAnimalData,
} from "./db-helpers";

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

// Inicializa o SQLite
export async function initSQLite(): Promise<Database> {
  if (typeof window === "undefined") {
    throw new Error("initSQLite must be called on the client side only");
  }

  if (db) return db;

  if (!SQL) {
    const mod = await import("sql.js");
    type InitSqlJsFunc = (config?: {
      locateFile?: (file: string) => string;
    }) => Promise<SqlJsStatic>;
    const initSqlJs: InitSqlJsFunc =
      (mod as { default?: InitSqlJsFunc }).default ??
      (mod as unknown as InitSqlJsFunc);
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }

  // Tenta carregar banco existente do localStorage
  const savedDb = localStorage.getItem("rico_ouro_db");
  if (savedDb) {
    try {
      const buffer = Uint8Array.from(JSON.parse(savedDb));
      if (!SQL) throw new Error("sql.js not initialized");
      db = new SQL.Database(buffer);
      await createTables(db);
    } catch (error) {
      console.warn("Erro ao carregar banco salvo, criando novo:", error);
      if (!SQL) throw new Error("sql.js not initialized");
      db = new SQL.Database();
      await createTables(db);
    }
  } else {
    if (!SQL) throw new Error("sql.js not initialized");
    db = new SQL.Database();
    await createTables(db);
  }

  // Salva periodicamente no localStorage
  setInterval(() => {
    if (db) {
      const data = db.export();
      localStorage.setItem("rico_ouro_db", JSON.stringify(Array.from(data)));
    }
  }, 5000);

  return db;
}

async function createTables(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS animal_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      animal_json TEXT NOT NULL,
      pai_json TEXT,
      mae_json TEXT,
      avo_materno_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced_at TEXT,
      is_synced INTEGER DEFAULT 0
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_animal_uuid ON animal_data(uuid)
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS vaccines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      vaccine_name TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced_at TEXT,
      is_synced INTEGER DEFAULT 0
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_vaccines_uuid ON vaccines(uuid)
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      farm_name TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced_at TEXT,
      is_synced INTEGER DEFAULT 0
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_farms_uuid ON farms(uuid)
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS matrizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE,
      matriz_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      synced_at TEXT,
      is_synced INTEGER DEFAULT 0
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_matrizes_uuid ON matrizes(uuid)
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      record_id INTEGER,
      uuid TEXT,
      data_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Operações AnimalData
export async function addAnimalData(
  animal: AnimalData,
  providedUuid?: string
): Promise<number> {
  const database = await initSQLite();
  const uuid = providedUuid || crypto.randomUUID();

  const normalized = normalizeAnimalData(animal);
  const serialized = serializeAnimalData(normalized);

  const isSynced = providedUuid ? 1 : 0;

  database.run(
    `INSERT INTO animal_data (uuid, animal_json, pai_json, mae_json, avo_materno_json, updated_at, is_synced)
     VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
    [
      uuid,
      serialized.animal_json,
      serialized.pai_json,
      serialized.mae_json,
      serialized.avo_materno_json,
      isSynced,
    ]
  );

  const id = database.exec("SELECT last_insert_rowid() as id")[0]
    .values[0][0] as number;

  if (!isSynced) {
    addToSyncQueue(
      database,
      "animal_data",
      "INSERT",
      id,
      uuid,
      JSON.stringify(normalized)
    );
  }

  return id;
}

// Busca animal por UUID (usado na sincronização)
export async function getAnimalDataByUuid(
  uuid: string
): Promise<AnimalData | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, animal_json, pai_json, mae_json, avo_materno_json 
     FROM animal_data WHERE uuid = ?`,
    [uuid]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return deserializeAnimalData(
    row[0] as number,
    row[2] as string,
    row[3] as string | null,
    row[4] as string | null,
    row[5] as string | null
  );
}

export async function updateAnimalData(
  id: number,
  animal: AnimalData
): Promise<void> {
  const database = await initSQLite();

  const normalized = normalizeAnimalData(animal);
  const serialized = serializeAnimalData(normalized);

  const result = database.exec(`SELECT uuid FROM animal_data WHERE id = ?`, [
    id,
  ]);

  const uuid = result.length > 0 ? (result[0].values[0][0] as string) : null;

  database.run(
    `UPDATE animal_data 
     SET animal_json = ?, pai_json = ?, mae_json = ?, avo_materno_json = ?, 
         updated_at = datetime('now'), is_synced = 0
     WHERE id = ?`,
    [
      serialized.animal_json,
      serialized.pai_json,
      serialized.mae_json,
      serialized.avo_materno_json,
      id,
    ]
  );

  if (uuid) {
    addToSyncQueue(
      database,
      "animal_data",
      "UPDATE",
      id,
      uuid,
      JSON.stringify(normalized)
    );
  }
}

export async function getAnimalDataById(
  id: number
): Promise<AnimalData | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, animal_json, pai_json, mae_json, avo_materno_json 
     FROM animal_data WHERE id = ?`,
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return deserializeAnimalData(
    row[0] as number,
    row[2] as string,
    row[3] as string | null,
    row[4] as string | null,
    row[5] as string | null
  );
}

export async function getAnimalDataByRgn(
  rgn: string
): Promise<AnimalData | undefined> {
  const allAnimals = await getAllAnimalData();
  return allAnimals.find((animal) => animal.animal?.rgn === rgn);
}

export async function getAllAnimalData(): Promise<AnimalData[]> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, animal_json, pai_json, mae_json, avo_materno_json 
     FROM animal_data 
     ORDER BY id DESC`
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map((row) =>
    deserializeAnimalData(
      row[0] as number,
      row[2] as string,
      row[3] as string | null,
      row[4] as string | null,
      row[5] as string | null
    )
  );
}

export async function deleteAnimalData(id: number): Promise<void> {
  const database = await initSQLite();

  const result = database.exec(`SELECT uuid FROM animal_data WHERE id = ?`, [
    id,
  ]);

  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(`DELETE FROM animal_data WHERE id = ?`, [id]);

  if (uuid) {
    addToSyncQueue(database, "animal_data", "DELETE", id, uuid, null);
  }
}

export async function clearAnimalData(): Promise<void> {
  const database = await initSQLite();
  database.run(`DELETE FROM animal_data`);
  database.run(`DELETE FROM sync_queue WHERE table_name = 'animal_data'`);
}

// Operações Vaccines
export async function addVaccine(
  vaccine: Vaccine,
  providedUuid?: string
): Promise<number> {
  const database = await initSQLite();
  const uuid = providedUuid || crypto.randomUUID();

  const isSynced = providedUuid ? 1 : 0;

  database.run(
    `INSERT INTO vaccines (uuid, vaccine_name, updated_at, is_synced)
     VALUES (?, ?, datetime('now'), ?)`,
    [uuid, vaccine.vaccineName, isSynced]
  );

  const id = database.exec("SELECT last_insert_rowid() as id")[0]
    .values[0][0] as number;

  if (!isSynced) {
    addToSyncQueue(
      database,
      "vaccines",
      "INSERT",
      id,
      uuid,
      JSON.stringify(vaccine)
    );
  }

  return id;
}

// Busca vacina por UUID (usado na sincronização)
export async function getVaccineByUuid(
  uuid: string
): Promise<Vaccine | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, vaccine_name FROM vaccines WHERE uuid = ?`,
    [uuid]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    vaccineName: row[2] as string,
  };
}

export async function updateVaccine(
  id: number,
  vaccine: Vaccine
): Promise<void> {
  const database = await initSQLite();

  const result = database.exec(`SELECT uuid FROM vaccines WHERE id = ?`, [id]);

  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(
    `UPDATE vaccines 
     SET vaccine_name = ?, updated_at = datetime('now'), is_synced = 0
     WHERE id = ?`,
    [vaccine.vaccineName, id]
  );

  if (uuid) {
    addToSyncQueue(
      database,
      "vaccines",
      "UPDATE",
      id,
      uuid,
      JSON.stringify(vaccine)
    );
  }
}

export async function getVaccineById(id: number): Promise<Vaccine | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, vaccine_name FROM vaccines WHERE id = ?`,
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    vaccineName: row[2] as string,
  };
}

export async function getVaccineByName(
  name: string
): Promise<Vaccine | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, vaccine_name FROM vaccines WHERE vaccine_name = ?`,
    [name]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    vaccineName: row[2] as string,
  };
}

export async function getAllVaccines(): Promise<Vaccine[]> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, vaccine_name FROM vaccines ORDER BY vaccine_name`
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map((row) => ({
    id: row[0] as number,
    vaccineName: row[2] as string,
  }));
}

export async function deleteVaccine(id: number): Promise<void> {
  const database = await initSQLite();

  const result = database.exec(`SELECT uuid FROM vaccines WHERE id = ?`, [id]);

  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(`DELETE FROM vaccines WHERE id = ?`, [id]);

  if (uuid) {
    addToSyncQueue(database, "vaccines", "DELETE", id, uuid, null);
  }
}

// Operações Farms
export async function addFarm(
  farm: Farm,
  providedUuid?: string
): Promise<number> {
  const database = await initSQLite();
  const uuid = providedUuid || crypto.randomUUID();
  const isSynced = providedUuid ? 1 : 0;

  database.run(
    `INSERT INTO farms (uuid, farm_name, updated_at, is_synced)
     VALUES (?, ?, datetime('now'), ?)`,
    [uuid, farm.farmName, isSynced]
  );

  const id = database.exec("SELECT last_insert_rowid() as id")[0]
    .values[0][0] as number;

  if (!isSynced) {
    addToSyncQueue(database, "farms", "INSERT", id, uuid, JSON.stringify(farm));
  }

  return id;
}

export async function getFarmByUuid(uuid: string): Promise<Farm | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, farm_name FROM farms WHERE uuid = ?`,
    [uuid]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    farmName: row[2] as string,
  };
}

export async function getFarmById(id: number): Promise<Farm | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, farm_name FROM farms WHERE id = ?`,
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    farmName: row[2] as string,
  };
}

export async function getFarmByName(name: string): Promise<Farm | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, farm_name FROM farms WHERE farm_name = ?`,
    [name]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return undefined;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    farmName: row[2] as string,
  };
}

export async function getAllFarms(): Promise<Farm[]> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, farm_name FROM farms ORDER BY farm_name`
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map((row) => ({
    id: row[0] as number,
    farmName: row[2] as string,
  }));
}

export async function updateFarm(id: number, farm: Farm): Promise<void> {
  const database = await initSQLite();
  const result = database.exec(`SELECT uuid FROM farms WHERE id = ?`, [id]);

  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(
    `UPDATE farms
     SET farm_name = ?, updated_at = datetime('now'), is_synced = 0
     WHERE id = ?`,
    [farm.farmName, id]
  );

  if (uuid) {
    addToSyncQueue(database, "farms", "UPDATE", id, uuid, JSON.stringify(farm));
  }
}

export async function deleteFarm(id: number): Promise<void> {
  const database = await initSQLite();
  const result = database.exec(`SELECT uuid FROM farms WHERE id = ?`, [id]);

  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(`DELETE FROM farms WHERE id = ?`, [id]);

  if (uuid) {
    addToSyncQueue(database, "farms", "DELETE", id, uuid, null);
  }
}

// Operações Matrizes
export async function addMatriz(
  matriz: Matriz,
  providedUuid?: string
): Promise<number> {
  const database = await initSQLite();
  const uuid = providedUuid || crypto.randomUUID();
  const isSynced = providedUuid ? 1 : 0;

  database.run(
    `INSERT INTO matrizes (uuid, matriz_json, updated_at, is_synced)
     VALUES (?, ?, datetime('now'), ?)`,
    [uuid, JSON.stringify(matriz), isSynced]
  );

  const id = database.exec("SELECT last_insert_rowid() as id")[0]
    .values[0][0] as number;

  if (!isSynced) {
    addToSyncQueue(
      database,
      "matrizes",
      "INSERT",
      id,
      uuid,
      JSON.stringify(matriz)
    );
  }

  return id;
}

export async function getMatrizByUuid(
  uuid: string
): Promise<{ id: number; matriz: Matriz } | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, matriz_json FROM matrizes WHERE uuid = ?`,
    [uuid]
  );

  if (result.length === 0 || result[0].values.length === 0) return undefined;
  const row = result[0].values[0];
  return {
    id: row[0] as number,
    matriz: JSON.parse(row[2] as string) as Matriz,
  };
}

export async function getMatrizById(
  id: number
): Promise<{ id: number; matriz: Matriz } | undefined> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, matriz_json FROM matrizes WHERE id = ?`,
    [id]
  );

  if (result.length === 0 || result[0].values.length === 0) return undefined;
  const row = result[0].values[0];
  return {
    id: row[0] as number,
    matriz: JSON.parse(row[2] as string) as Matriz,
  };
}

export async function getAllMatrizes(): Promise<
  Array<{ id: number; matriz: Matriz }>
> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, uuid, matriz_json FROM matrizes ORDER BY id DESC`
  );
  if (result.length === 0) return [];
  return result[0].values.map((row) => ({
    id: row[0] as number,
    matriz: JSON.parse(row[2] as string) as Matriz,
  }));
}

export async function getMatrizesByType(
  type: string
): Promise<Array<{ id: number; matriz: Matriz }>> {
  const all = await getAllMatrizes();
  return all.filter((item) => item.matriz.type === type);
}

export async function updateMatriz(id: number, matriz: Matriz): Promise<void> {
  const database = await initSQLite();

  const result = database.exec(`SELECT uuid FROM matrizes WHERE id = ?`, [id]);
  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(
    `UPDATE matrizes SET matriz_json = ?, updated_at = datetime('now'), is_synced = 0 WHERE id = ?`,
    [JSON.stringify(matriz), id]
  );

  if (uuid) {
    addToSyncQueue(
      database,
      "matrizes",
      "UPDATE",
      id,
      uuid,
      JSON.stringify(matriz)
    );
  }
}

export async function deleteMatriz(id: number): Promise<void> {
  const database = await initSQLite();
  const result = database.exec(`SELECT uuid FROM matrizes WHERE id = ?`, [id]);
  const uuid =
    result.length > 0 && result[0].values.length > 0
      ? (result[0].values[0][0] as string)
      : null;

  database.run(`DELETE FROM matrizes WHERE id = ?`, [id]);

  if (uuid) {
    addToSyncQueue(database, "matrizes", "DELETE", id, uuid, null);
  }
}

export async function clearMatrizes(): Promise<void> {
  const database = await initSQLite();
  database.run(`DELETE FROM matrizes`);
  database.run(`DELETE FROM sync_queue WHERE table_name = 'matrizes'`);
}

// Fila de sincronização
function addToSyncQueue(
  database: Database,
  tableName: string,
  operation: string,
  recordId: number,
  uuid: string | null,
  dataJson: string | null
): void {
  database.run(
    `INSERT INTO sync_queue (table_name, operation, record_id, uuid, data_json)
     VALUES (?, ?, ?, ?, ?)`,
    [tableName, operation, recordId, uuid, dataJson]
  );
}

export async function getSyncQueue(): Promise<
  Array<{
    id: number;
    table_name: string;
    operation: string;
    record_id: number;
    uuid: string | null;
    data_json: string | null;
  }>
> {
  const database = await initSQLite();
  const result = database.exec(
    `SELECT id, table_name, operation, record_id, uuid, data_json FROM sync_queue ORDER BY created_at`
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map((row) => ({
    id: row[0] as number,
    table_name: row[1] as string,
    operation: row[2] as string,
    record_id: row[3] as number,
    uuid: row[4] as string | null,
    data_json: row[5] as string | null,
  }));
}

export async function removeFromSyncQueue(id: number): Promise<void> {
  const database = await initSQLite();
  database.run(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}

// Marca registro como sincronizado
export async function markAsSynced(
  tableName: string,
  recordId: number,
  _uuid: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> {
  const database = await initSQLite();

  // Valida nome da tabela para prevenir SQL injection
  if (
    tableName !== "animal_data" &&
    tableName !== "vaccines" &&
    tableName !== "farms" &&
    tableName !== "matrizes"
  ) {
    throw new Error(`Tabela inválida: ${tableName}`);
  }

  database.run(
    `UPDATE ${tableName} 
     SET is_synced = 1, synced_at = datetime('now')
     WHERE id = ?`,
    [recordId]
  );

  // Remove da fila de sincronização se existir
  database.run(
    `DELETE FROM sync_queue 
     WHERE table_name = ? AND record_id = ?`,
    [tableName, recordId]
  );
}

// Verifica se o banco já foi sincronizado (tem pelo menos um registro sincronizado)
export async function hasSyncedRecords(): Promise<boolean> {
  const database = await initSQLite();

  const tables = ["animal_data", "vaccines", "farms", "matrizes"];

  for (const table of tables) {
    const result = database.exec(
      `SELECT COUNT(*) FROM ${table} WHERE is_synced = 1`
    );

    if (result.length > 0 && result[0].values.length > 0) {
      const count = result[0].values[0][0] as number;
      if (count > 0) {
        return true;
      }
    }
  }

  return false;
}

// Força salvamento no localStorage
export async function saveDatabase(): Promise<void> {
  if (db) {
    const data = db.export();
    localStorage.setItem("rico_ouro_db", JSON.stringify(Array.from(data)));
  }
}
