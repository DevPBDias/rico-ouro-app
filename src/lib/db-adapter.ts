import {
  initSQLite,
  addAnimalData as sqliteAddAnimalData,
  updateAnimalData as sqliteUpdateAnimalData,
  getAnimalDataById as sqliteGetAnimalDataById,
  getAnimalDataByRgn as sqliteGetAnimalDataByRgn,
  getAllAnimalData as sqliteGetAllAnimalData,
  deleteAnimalData as sqliteDeleteAnimalData,
  clearAnimalData as sqliteClearAnimalData,
  addVaccine as sqliteAddVaccine,
  updateVaccine as sqliteUpdateVaccine,
  getVaccineById as sqliteGetVaccineById,
  getVaccineByName as sqliteGetVaccineByName,
  getAllVaccines as sqliteGetAllVaccines,
  deleteVaccine as sqliteDeleteVaccine,
  addFarm as sqliteAddFarm,
  updateFarm as sqliteUpdateFarm,
  getFarmById as sqliteGetFarmById,
  getFarmByName as sqliteGetFarmByName,
  getAllFarms as sqliteGetAllFarms,
  deleteFarm as sqliteDeleteFarm,
  saveDatabase,
} from "./sqlite-db";
import { AnimalData, Vaccine, Farm } from "./db";

// Classe que simula a interface do Dexie para compatibilidade
export class AnimalDataTable {
  async toArray(): Promise<AnimalData[]> {
    await initSQLite();
    return await sqliteGetAllAnimalData();
  }

  async get(id: number): Promise<AnimalData | undefined> {
    await initSQLite();
    return await sqliteGetAnimalDataById(id);
  }

  async add(animal: AnimalData): Promise<number> {
    await initSQLite();
    const id = await sqliteAddAnimalData(animal);
    await saveDatabase();
    return id;
  }

  async put(animal: AnimalData & { id: number }): Promise<number> {
    await initSQLite();
    await sqliteUpdateAnimalData(animal.id, animal);
    await saveDatabase();
    return animal.id;
  }

  async bulkPut(animals: AnimalData[]): Promise<void> {
    await initSQLite();
    for (const animal of animals) {
      if (animal.id) {
        await sqliteUpdateAnimalData(animal.id, animal);
      } else {
        await sqliteAddAnimalData(animal);
      }
    }
    await saveDatabase();
  }

  async bulkAdd(animals: AnimalData[]): Promise<number[]> {
    await initSQLite();
    const ids: number[] = [];
    for (const animal of animals) {
      const id = await sqliteAddAnimalData(animal);
      ids.push(id);
    }
    await saveDatabase();
    return ids;
  }

  async update(id: number, changes: Partial<AnimalData>): Promise<number> {
    await initSQLite();
    const existing = await sqliteGetAnimalDataById(id);
    if (!existing) {
      throw new Error(`Animal com id ${id} não encontrado`);
    }

    const updated: AnimalData = {
      ...existing,
      ...changes,
      animal: {
        ...existing.animal,
        ...changes.animal,
        updatedAt: new Date().toISOString(),
      },
    };

    await sqliteUpdateAnimalData(id, updated);
    await saveDatabase();
    return id;
  }

  async delete(id: number): Promise<void> {
    await initSQLite();
    await sqliteDeleteAnimalData(id);
    await saveDatabase();
  }

  async clear(): Promise<void> {
    await initSQLite();
    await sqliteClearAnimalData();
    await saveDatabase();
  }

  where(field: string) {
    return new AnimalDataWhereClause(field);
  }
}

// Classe para simular queries do Dexie
class AnimalDataWhereClause {
  constructor(private field: string) {}

  equals(value: string | [string, string]): AnimalDataWhereQuery {
    return new AnimalDataWhereQuery(this.field, "equals", value);
  }
}

class AnimalDataWhereQuery {
  constructor(
    private field: string,
    private operator: string,
    private value: string | [string, string]
  ) {}

  async first(): Promise<AnimalData | undefined> {
    await initSQLite();

    if (this.field === "animal.rgn" && this.operator === "equals") {
      return await sqliteGetAnimalDataByRgn(this.value as string);
    }

    if (this.field === "[animal.serieRGD+animal.rgn]" && this.operator === "equals") {
      const [serieRGD, rgn] = this.value as [string, string];
      const animal = await sqliteGetAnimalDataByRgn(rgn);
      if (animal && animal.animal.serieRGD === serieRGD) {
        return animal;
      }
      return undefined;
    }

    return undefined;
  }

  async delete(): Promise<void> {
    const animal = await this.first();
    if (animal && animal.id) {
      await sqliteDeleteAnimalData(animal.id);
      await saveDatabase();
    }
  }
}

// Classe para tabela de vacinas
export class VaccineTable {
  async toArray(): Promise<Vaccine[]> {
    await initSQLite();
    return await sqliteGetAllVaccines();
  }

  async get(id: number): Promise<Vaccine | undefined> {
    await initSQLite();
    return await sqliteGetVaccineById(id);
  }

  async add(vaccine: Vaccine): Promise<number> {
    await initSQLite();
    const id = await sqliteAddVaccine(vaccine);
    await saveDatabase();
    return id;
  }

  async bulkAdd(vaccines: Vaccine[]): Promise<number[]> {
    await initSQLite();
    const ids: number[] = [];
    for (const vaccine of vaccines) {
      const id = await sqliteAddVaccine(vaccine);
      ids.push(id);
    }
    await saveDatabase();
    return ids;
  }

  async delete(id: number): Promise<void> {
    await initSQLite();
    await sqliteDeleteVaccine(id);
    await saveDatabase();
  }

  async update(id: number, changes: Partial<Vaccine>): Promise<number> {
    await initSQLite();
    const existing = await sqliteGetVaccineById(id);
    if (!existing) {
      throw new Error(`Vacina com id ${id} não encontrada`);
    }

    const updated: Vaccine = {
      ...existing,
      ...changes,
    };

    await sqliteUpdateVaccine(id, updated);
    await saveDatabase();
    return id;
  }

  orderBy(field: string) {
    return new VaccineOrderByClause(field);
  }

  where(field: string) {
    return new VaccineWhereClause(field);
  }
}

class VaccineOrderByClause {
  constructor(private field: string) {}

  async toArray(): Promise<Vaccine[]> {
    await initSQLite();
    return await sqliteGetAllVaccines();
  }
}

class VaccineWhereClause {
  constructor(private field: string) {}

  equals(value: string): VaccineWhereQuery {
    return new VaccineWhereQuery(this.field, "equals", value);
  }
}

class VaccineWhereQuery {
  constructor(
    private field: string,
    private operator: string,
    private value: string
  ) {}

  async first(): Promise<Vaccine | undefined> {
    await initSQLite();

    if (this.field === "vaccineName" && this.operator === "equals") {
      return await sqliteGetVaccineByName(this.value);
    }

    return undefined;
  }
}

// Classe para tabela de fazendas
export class FarmTable {
  async toArray(): Promise<Farm[]> {
    await initSQLite();
    return await sqliteGetAllFarms();
  }

  async get(id: number): Promise<Farm | undefined> {
    await initSQLite();
    return await sqliteGetFarmById(id);
  }

  async add(farm: Farm): Promise<number> {
    await initSQLite();
    const id = await sqliteAddFarm(farm);
    await saveDatabase();
    return id;
  }

  async bulkAdd(farms: Farm[]): Promise<number[]> {
    await initSQLite();
    const ids: number[] = [];
    for (const farm of farms) {
      const id = await sqliteAddFarm(farm);
      ids.push(id);
    }
    await saveDatabase();
    return ids;
  }

  async delete(id: number): Promise<void> {
    await initSQLite();
    await sqliteDeleteFarm(id);
    await saveDatabase();
  }

  async update(id: number, changes: Partial<Farm>): Promise<number> {
    await initSQLite();
    const existing = await sqliteGetFarmById(id);
    if (!existing) {
      throw new Error(`Fazenda com id ${id} não encontrada`);
    }

    const updated: Farm = {
      ...existing,
      ...changes,
    };

    await sqliteUpdateFarm(id, updated);
    await saveDatabase();
    return id;
  }

  orderBy(field: string) {
    return new FarmOrderByClause(field);
  }

  where(field: string) {
    return new FarmWhereClause(field);
  }
}

class FarmOrderByClause {
  constructor(private field: string) {}

  async toArray(): Promise<Farm[]> {
    await initSQLite();
    return await sqliteGetAllFarms();
  }
}

class FarmWhereClause {
  constructor(private field: string) {}

  equals(value: string): FarmWhereQuery {
    return new FarmWhereQuery(this.field, "equals", value);
  }
}

class FarmWhereQuery {
  constructor(
    private field: string,
    private operator: string,
    private value: string
  ) {}

  async first(): Promise<Farm | undefined> {
    await initSQLite();

    if (this.field === "farmName" && this.operator === "equals") {
      return await sqliteGetFarmByName(this.value);
    }

    return undefined;
  }
}

// Database adapter que simula Dexie
export class DatabaseAdapter {
  animalData: AnimalDataTable;
  vaccines: VaccineTable;
  farms: FarmTable;

  constructor() {
    this.animalData = new AnimalDataTable();
    this.vaccines = new VaccineTable();
    this.farms = new FarmTable();
  }

  async transaction(
    mode: "rw" | "r",
    tables: unknown[] | unknown,
    callback: () => Promise<void>
  ): Promise<void> {
    // SQLite não precisa de transações explícitas no nosso caso
    // mas mantemos a interface para compatibilidade
    await callback();
  }
}

// Instância global
export const dbAdapter = new DatabaseAdapter();

