import { getDatabase } from "@/db/rxdb";
import {
  AnimalDocType,
  FarmDocType,
  MatrizDocType,
  VaccineTypeDocType,
} from "@/types/database.types";

export async function getAnimalsRSC(): Promise<AnimalDocType[]> {
  const db = await getDatabase();
  const docs = await db.animals
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ updatedAt: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalDocType);
}

export async function getAnimalRSC(
  uuid: string
): Promise<AnimalDocType | null> {
  const db = await getDatabase();
  const doc = await db.animals.findOne(uuid).exec();
  return doc ? (doc.toJSON() as AnimalDocType) : null;
}

export async function getFarmsRSC(): Promise<FarmDocType[]> {
  const db = await getDatabase();
  const docs = await db.farms
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ farmName: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as FarmDocType);
}

export async function getFarmRSC(uuid: string): Promise<FarmDocType | null> {
  const db = await getDatabase();
  const doc = await db.farms.findOne(uuid).exec();
  return doc ? (doc.toJSON() as FarmDocType) : null;
}

export async function getMatricesRSC(): Promise<MatrizDocType[]> {
  const db = await getDatabase();
  const docs = await db.matriz
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ nome: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as MatrizDocType);
}

export async function getMatrizRSC(
  uuid: string
): Promise<MatrizDocType | null> {
  const db = await getDatabase();
  const doc = await db.matriz.findOne(uuid).exec();
  return doc ? (doc.toJSON() as MatrizDocType) : null;
}

export async function getVaccineTypesRSC(): Promise<VaccineTypeDocType[]> {
  const db = await getDatabase();
  const docs = await db.vaccines
    .find({
      selector: {
        _deleted: { $eq: false },
      },
      sort: [{ vaccineName: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as VaccineTypeDocType);
}

export async function getAnimalsByFarmRSC(
  farmUuid: string
): Promise<AnimalDocType[]> {
  const db = await getDatabase();
  const docs = await db.animals
    .find({
      selector: {
        _deleted: { $eq: false },
        "animal.farm": { $eq: farmUuid },
      },
      sort: [{ updatedAt: "desc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as AnimalDocType);
}

export async function getMatricesByFarmRSC(
  farmUuid: string
): Promise<MatrizDocType[]> {
  const db = await getDatabase();
  const docs = await db.matriz
    .find({
      selector: {
        _deleted: { $eq: false },
        farm: { $eq: farmUuid },
      },
      sort: [{ nome: "asc" as const }],
    })
    .exec();

  return docs.map((doc) => doc.toJSON() as MatrizDocType);
}

export async function countAnimalsRSC(): Promise<number> {
  const db = await getDatabase();
  return await db.animals
    .count({
      selector: {
        _deleted: { $eq: false },
      },
    })
    .exec();
}

export async function countMatricesRSC(): Promise<number> {
  const db = await getDatabase();
  return await db.matriz
    .count({
      selector: {
        _deleted: { $eq: false },
      },
    })
    .exec();
}
