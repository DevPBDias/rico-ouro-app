import { useCallback, useEffect, useMemo, useState } from "react";
import { db, type Farm } from "@/lib/db";

export function useFarms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFarms = useCallback(async () => {
    const items = await db.farms.orderBy("farmName").toArray();
    setFarms(items);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await loadFarms();
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
      if (!trimmed) throw new Error("Informe o nome da fazenda.");

      const existing = await db.farms.where("farmName").equals(trimmed).first();
      const existsWithDifferentCase = !existing
        ? (await db.farms.toArray()).some(
            (item) => item.farmName.trim().toLowerCase() === trimmed.toLowerCase()
          )
        : false;
      if (existing || existsWithDifferentCase) throw new Error("Essa fazenda já está cadastrada.");

      const uuid = crypto.randomUUID();
      await db.farms.add({ farmName: trimmed, uuid, updatedAt: new Date().toISOString() });
      await db.syncQueue.add({
        id: crypto.randomUUID(),
        table: "farms",
        operation: "create",
        payload: { farmName: trimmed },
        uuid,
        createdAt: new Date().toISOString(),
      });
      await loadFarms();
    },
    [loadFarms]
  );

  const removeFarm = useCallback(async (id: number) => {
    const record = await db.farms.get(id);
    await db.farms.delete(id);
    const uuid = record?.uuid || crypto.randomUUID();
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      table: "farms",
      operation: "delete",
      payload: null,
      uuid,
      createdAt: new Date().toISOString(),
    });
    await loadFarms();
  }, [loadFarms]);

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

