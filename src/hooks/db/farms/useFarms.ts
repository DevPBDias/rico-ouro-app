"use client";

import { useState, useEffect } from "react";
import { useRxDB } from "@/providers/RxDBProvider";
import { Farm } from "@/types/farm.type";
import { v4 as uuidv4 } from "uuid";

export function useFarms() {
  const { db, isLoading: dbLoading } = useRxDB();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        sort: [{ farm_name: "asc" }],
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

  const createFarm = async (farmName: string) => {
    if (!db) throw new Error("Database not ready");

    const newFarm: Farm = {
      id: uuidv4(),
      farm_name: farmName,
      _deleted: false,
    };

    await db.farms.insert(newFarm);
    return newFarm;
  };

  const updateFarm = async (id: string, farmName: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.farms.findOne(id).exec();
    if (!doc) throw new Error("Farm not found");

    await doc.update({
      $set: {
        farm_name: farmName,
      },
    });
  };

  const deleteFarm = async (id: string) => {
    if (!db) throw new Error("Database not ready");

    const doc = await db.farms.findOne(id).exec();
    if (!doc) throw new Error("Farm not found");

    await doc.update({
      $set: {
        _deleted: true,
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
