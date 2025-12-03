"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { AnimalData } from "@/types/schemas.types";
import { v4 as uuidv4 } from "uuid";

export function useAnimals() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.animals
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ updatedAt: "desc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as AnimalData);
          setAnimals(data);
          setIsLoading(false);
        },
        error: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [db, dbLoading]);

  const createAnimal = async (data: Partial<AnimalData>) => {
    if (!db) throw new Error("Database not ready");

    const newAnimal: AnimalData = {
      uuid: uuidv4(),
      updatedAt: new Date().toISOString(),
      _deleted: false,
      ...data,
    } as AnimalData;

    await db.animals.insert(newAnimal);
    return newAnimal;
  };

  const updateAnimal = async (uuid: string, data: Partial<AnimalData>) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.animals.findOne(uuid).exec();
    if (!doc) throw new Error("Animal not found");

    await doc.update({
      $set: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const deleteAnimal = async (uuid: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.animals.findOne(uuid).exec();
    if (!doc) throw new Error("Animal not found");

    await doc.update({
      $set: {
        _deleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  return {
    animals,
    isLoading,
    error,
    createAnimal,
    updateAnimal,
    deleteAnimal,
  };
}
