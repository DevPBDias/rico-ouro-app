"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Farm } from "@/types/schemas.types";
import { v4 as uuidv4 } from "uuid";

export function useFarms() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to farms collection
  useEffect(() => {
    if (!db) {
      setIsLoading(dbLoading);
      return;
    }

    setIsLoading(true);

    const subscription = db.farms
      .find({
        selector: {
          _deleted: { $eq: false },
        },
        sort: [{ farmName: "asc" }],
      })
      .$.subscribe({
        next: (docs) => {
          const data = docs.map((doc) => doc.toJSON() as Farm);
          setFarms(data);
          setIsLoading(false);
        },
        error: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [db, dbLoading]);

  // Create farm
  const createFarm = async (farmName: string) => {
    if (!db) throw new Error("Database not ready");

    const newFarm: Farm = {
      uuid: uuidv4(),
      farmName,
      updatedAt: new Date().toISOString(),
      _deleted: false,
    };

    await db.farms.insert(newFarm);
    return newFarm;
  };

  // Update farm
  const updateFarm = async (uuid: string, farmName: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.farms.findOne(uuid).exec();
    if (!doc) throw new Error("Farm not found");

    await doc.update({
      $set: {
        farmName,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  // Delete farm (soft delete)
  const deleteFarm = async (uuid: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.farms.findOne(uuid).exec();
    if (!doc) throw new Error("Farm not found");

    await doc.update({
      $set: {
        _deleted: true,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  return {
    farms,
    isLoading,
    error,
    createFarm,
    updateFarm,
    deleteFarm,
  };
}
