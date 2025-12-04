"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRxDatabase } from "@/providers/RxDBProvider";
import type { RxDocument, MangoQuery } from "rxdb";
import type {
  AnimalDocType,
  MatrizDocType,
  FarmDocType,
  VaccineTypeDocType,
} from "@/types/database.types";

export function useRxQuery<T>(
  collectionName: string,
  query?: MangoQuery<T> | null
) {
  const db = useRxDatabase();
  const [documents, setDocuments] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !query) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    const collection = (db as any)[collectionName];
    if (!collection) {
      setError(new Error(`Collection ${collectionName} not found`));
      setIsLoading(false);
      return;
    }

    try {
      const rxQuery = collection.find(query);

      const subscription = rxQuery.$.subscribe({
        next: (results: RxDocument<T>[]) => {
          setDocuments(results.map((doc) => doc.toJSON() as T));
          setIsLoading(false);
          setError(null);
        },
        error: (err: unknown) => {
          setError(
            err instanceof Error ? err : new Error("Query subscription error")
          );
          setIsLoading(false);
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Query creation error"));
      setIsLoading(false);
    }
  }, [db, collectionName, JSON.stringify(query)]);

  return { data: documents, isLoading, error };
}

export function useRxDocument<T>(
  collectionName: string,
  documentId: string | null | undefined
) {
  const db = useRxDatabase();
  const [document, setDocument] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !documentId) {
      setDocument(null);
      setIsLoading(false);
      return;
    }

    const collection = (db as any)[collectionName];
    if (!collection) {
      setError(new Error(`Collection ${collectionName} not found`));
      setIsLoading(false);
      return;
    }

    const subscription = collection.findOne(documentId).$.subscribe({
      next: (doc: RxDocument<T> | null) => {
        setDocument(doc ? (doc.toJSON() as T) : null);
        setIsLoading(false);
        setError(null);
      },
      error: (err: unknown) => {
        setError(
          err instanceof Error ? err : new Error("Document fetch error")
        );
        setIsLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [db, collectionName, documentId]);

  return { data: document, isLoading, error };
}

export function useAnimals(filters?: {
  farmId?: string;
  sex?: "M" | "F";
  status?: string;
  search?: string;
}) {
  const query = useMemo(() => {
    const selector: Record<string, unknown> = {};

    if (filters?.farmId) {
      selector["animal.farm"] = { $eq: filters.farmId };
    }

    if (filters?.sex) {
      selector["animal.sexo"] = { $eq: filters.sex };
    }

    if (filters?.status) {
      selector["animal.status"] = { $eq: filters.status };
    }

    if (filters?.search) {
      selector["animal.nome"] = { $regex: new RegExp(filters.search, "i") };
    }

    return {
      selector,
      sort: [{ updatedAt: "desc" as const }],
    };
  }, [filters?.farmId, filters?.sex, filters?.status, filters?.search]);

  return useRxQuery<AnimalDocType>("animals", query);
}

export function useAnimal(uuid: string | null | undefined) {
  const db = useRxDatabase();
  const [animal, setAnimal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !uuid) {
      setAnimal(null);
      setIsLoading(false);
      return;
    }

    const subscription = db.animals.findOne(uuid).$.subscribe((doc) => {
      setAnimal(doc);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [db, uuid]);

  return { data: animal, isLoading };
}

export function useAnimalActions() {
  const db = useRxDatabase();

  const insert = useCallback(
    async (data: Partial<AnimalDocType>) => {
      if (!db) throw new Error("Database not initialized");
      return await db.animals.insert({
        ...data,
        updatedAt: new Date().toISOString(),
        _deleted: false,
      } as any);
    },
    [db]
  );

  const update = useCallback(
    async (uuid: string, data: Partial<AnimalDocType>) => {
      if (!db) throw new Error("Database not initialized");
      const doc = await db.animals.findOne(uuid).exec();
      if (!doc) throw new Error(`Animal ${uuid} not found`);

      return await doc.patch({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [db]
  );

  const remove = useCallback(
    async (uuid: string) => {
      if (!db) throw new Error("Database not initialized");
      const doc = await db.animals.findOne(uuid).exec();
      if (!doc) throw new Error(`Animal ${uuid} not found`);

      return await doc.remove();
    },
    [db]
  );

  const bulkInsert = useCallback(
    async (animals: Partial<AnimalDocType>[]) => {
      if (!db) throw new Error("Database not initialized");
      const now = new Date().toISOString();
      return await db.animals.bulkInsert(
        animals.map(
          (a) =>
            ({
              ...a,
              updatedAt: now,
              _deleted: false,
            } as any)
        )
      );
    },
    [db]
  );

  const upsert = useCallback(
    async (data: Partial<AnimalDocType>) => {
      if (!db) throw new Error("Database not initialized");
      const now = new Date().toISOString();
      return await db.animals.upsert({
        ...data,
        updatedAt: now,
        _deleted: false,
      } as any);
    },
    [db]
  );

  const bulkUpsert = useCallback(
    async (animals: Partial<AnimalDocType>[]) => {
      if (!db) throw new Error("Database not initialized");
      const now = new Date().toISOString();
      return await db.animals.bulkUpsert(
        animals.map(
          (a) =>
            ({
              ...a,
              updatedAt: now,
              _deleted: false,
            } as any)
        )
      );
    },
    [db]
  );

  return {
    insert,
    update,
    remove,
    bulkInsert,
    upsert,
    bulkUpsert,
    isReady: !!db,
  };
}

export function useMatrizes(filters?: {
  farmId?: string;
  type?: "Doadora" | "Reprodutora" | "Receptora FIV";
  condition?: "Parida" | "Solteira";
  search?: string;
}) {
  const query = useMemo(() => {
    const selector: Record<string, unknown> = {};

    if (filters?.farmId) {
      selector.farm = { $eq: filters.farmId };
    }

    if (filters?.type) {
      selector.type = { $eq: filters.type };
    }

    if (filters?.condition) {
      selector.condition = { $eq: filters.condition };
    }

    if (filters?.search) {
      selector.nome = { $regex: new RegExp(filters.search, "i") };
    }

    return {
      selector,
      sort: [{ updatedAt: "desc" as const }],
    };
  }, [filters?.farmId, filters?.type, filters?.condition, filters?.search]);

  return useRxQuery<MatrizDocType>("matriz", query);
}

export function useMatriz(uuid: string | null | undefined) {
  const db = useRxDatabase();
  const [matriz, setMatriz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !uuid) {
      setMatriz(null);
      setIsLoading(false);
      return;
    }

    const subscription = db.matriz.findOne(uuid).$.subscribe((doc) => {
      setMatriz(doc);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [db, uuid]);

  return { data: matriz, isLoading };
}

export function useMatrizActions() {
  const db = useRxDatabase();

  const insert = useCallback(
    async (data: Partial<MatrizDocType>) => {
      if (!db) throw new Error("Database not initialized");
      return await db.matriz.insert({
        ...data,
        _deleted: false,
      } as any);
    },
    [db]
  );

  const update = useCallback(
    async (uuid: string, data: Partial<MatrizDocType>) => {
      if (!db) throw new Error("Database not initialized");
      const doc = await db.matriz.findOne(uuid).exec();
      if (!doc) throw new Error(`Matriz ${uuid} not found`);

      return await doc.patch({
        ...data,
      });
    },
    [db]
  );

  const remove = useCallback(
    async (uuid: string) => {
      if (!db) throw new Error("Database not initialized");
      const doc = await db.matriz.findOne(uuid).exec();
      if (!doc) throw new Error(`Matriz ${uuid} not found`);

      return await doc.remove();
    },
    [db]
  );

  const bulkInsert = useCallback(
    async (matrizes: Partial<MatrizDocType>[]) => {
      if (!db) throw new Error("Database not initialized");
      const now = new Date().toISOString();
      return await db.matriz.bulkInsert(
        matrizes.map(
          (m) =>
            ({
              ...m,
              updatedAt: now,
              _deleted: false,
            } as any)
        )
      );
    },
    [db]
  );

  return { insert, update, remove, bulkInsert, isReady: !!db };
}

export function useFarms() {
  const query = useMemo(
    () => ({
      selector: {},
      sort: [{ farmName: "asc" as const }],
    }),
    []
  );
  return useRxQuery<FarmDocType>("farms", query);
}

export function useVaccines() {
  const query = useMemo(
    () => ({
      selector: {},
      sort: [{ vaccineName: "asc" as const }],
    }),
    []
  );
  return useRxQuery<VaccineTypeDocType>("vaccines", query);
}
