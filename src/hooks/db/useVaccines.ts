"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Vaccine } from "@/types/schemas.types";
import { v4 as uuidv4 } from "uuid";

export function useVaccines() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to vaccines collection
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
        sort: [{ vaccineName: "asc" }],
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

  // Create vaccine
  const createVaccine = async (vaccineName: string) => {
    if (!db) throw new Error("Database not ready");

    const newVaccine: Vaccine = {
      uuid: uuidv4(),
      vaccineName,
      updatedAt: new Date().toISOString(),
      _deleted: false,
    };

    await db.vaccines.insert(newVaccine);
    return newVaccine;
  };

  // Update vaccine
  const updateVaccine = async (uuid: string, vaccineName: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.vaccines.findOne(uuid).exec();
    if (!doc) throw new Error("Vaccine not found");

    await doc.update({
      $set: {
        vaccineName,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  // Delete vaccine (soft delete)
  const deleteVaccine = async (uuid: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.vaccines.findOne(uuid).exec();
    if (!doc) throw new Error("Vaccine not found");

    await doc.update({
      $set: {
        _deleted: true,
        updatedAt: new Date().toISOString(),
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
