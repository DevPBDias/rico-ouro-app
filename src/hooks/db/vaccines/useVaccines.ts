"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Vaccine } from "@/types/vaccine.type";
import { v4 as uuidv4 } from "uuid";

export function useVaccines() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.vaccines
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ vaccine_name: "asc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as Vaccine);
          setVaccines(data);
          setIsLoading(false);
        },
        error: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [db, dbLoading]);

  const createVaccine = async (vaccineName: string) => {
    if (!db) throw new Error("Database not ready");

    const newVaccine: Vaccine = {
      id: uuidv4(),
      vaccine_name: vaccineName,
      updated_at: new Date().toISOString(),
      _deleted: false,
    };

    await db.vaccines.insert(newVaccine);
    return newVaccine;
  };

  const updateVaccine = async (id: string, vaccineName: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.vaccines.findOne(id).exec();
    if (!doc) throw new Error("Vaccine not found");

    await doc.update({
      $set: {
        vaccine_name: vaccineName,
        updated_at: new Date().toISOString(),
      },
    });
  };

  const deleteVaccine = async (id: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.vaccines.findOne(id).exec();
    if (!doc) throw new Error("Vaccine not found");

    await doc.update({
      $set: {
        _deleted: true,
        updated_at: new Date().toISOString(),
      },
    });
  };

  return {
    vaccines,
    isLoading,
    error,
    createVaccine,
    updateVaccine,
    deleteVaccine,
  };
}
