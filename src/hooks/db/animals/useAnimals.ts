"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Animal } from "@/types/animal.type";
import { v4 as uuidv4 } from "uuid";

export function useAnimals() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [animals, setAnimals] = useState<Animal[]>([]);
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
        sort: [{ updated_at: "desc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as Animal);
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

  const createAnimal = async (data: Partial<Animal>) => {
    if (!db) throw new Error("Database not ready");

    const newAnimal: Animal = {
      uuid: uuidv4(),
      _deleted: false,
      ...data,
    } as Animal;

    await db.animals.insert(newAnimal);
    return newAnimal;
  };

  const updateAnimal = async (uuid: string, data: Partial<Animal>) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.animals.findOne(uuid).exec();
    if (!doc) throw new Error("Animal not found");

    await doc.update({
      $set: {
        ...data,
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
