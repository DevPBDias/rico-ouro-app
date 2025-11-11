import { useCallback, useEffect, useMemo, useState } from "react";

import { db, seedFarms, type Farm } from "@/lib/db";

export function useFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFarms = useCallback(async () => {
    const data = await db.farms.orderBy("farmName").toArray();
    setFarms(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await seedFarms();
        if (!isMounted) return;
        await loadFarms();
      } catch (err) {
        if (!isMounted) return;
        setError("Não foi possível carregar as fazendas.");
        console.error("❌ Erro ao carregar fazendas:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadFarms]);

  const addFarm = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error("Informe o nome da fazenda.");
      }

      const existing = await db.farms
        .where("farmName")
        .equals(trimmed)
        .first();

      const existsWithDifferentCase = !existing
        ? (await db.farms.toArray()).some(
            (item) =>
              item.farmName.trim().toLowerCase() === trimmed.toLowerCase()
          )
        : false;

      if (existing || existsWithDifferentCase) {
        throw new Error("Essa fazenda já está cadastrada.");
      }

      const id = await db.farms.add({ farmName: trimmed });
      const added = await db.farms.get(id);
      if (added) {
        setFarms((prev) =>
          [...prev, added].sort((a, b) =>
            a.farmName.localeCompare(b.farmName, "pt-BR", {
              sensitivity: "base",
            })
          )
        );
      }
    },
    []
  );

  const removeFarm = useCallback(async (id: number) => {
    await db.farms.delete(id);
    setFarms((prev) => prev.filter((farm) => farm.id !== id));
  }, []);

  const normalizedFarms = useMemo(() => {
    return [...farms].sort((a, b) =>
      a.farmName.localeCompare(b.farmName, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [farms]);

  return {
    farms: normalizedFarms,
    loading,
    error,
    addFarm,
    removeFarm,
    reload: loadFarms,
  };
}

