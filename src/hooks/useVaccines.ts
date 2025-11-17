import { useCallback, useEffect, useMemo, useState } from "react";
import { db, type Vaccine } from "@/lib/db";

export function useVaccines() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVaccines = useCallback(async () => {
    const items = await db.vaccines.orderBy("vaccineName").toArray();
    setVaccines(items);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await loadVaccines();
        if (!isMounted) return;
        await loadVaccines();
      } catch (err) {
        if (!isMounted) return;
        setError("Não foi possível carregar as vacinas.");
        console.error("❌ Erro ao carregar vacinas:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadVaccines]);

  const addVaccine = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Informe o nome da vacina.");

      const existing = await db.vaccines.where("vaccineName").equals(trimmed).first();
      const existsWithDifferentCase = !existing
        ? (await db.vaccines.toArray()).some(
            (item) => item.vaccineName.trim().toLowerCase() === trimmed.toLowerCase()
          )
        : false;
      if (existing || existsWithDifferentCase) throw new Error("Essa vacina já está cadastrada.");

      const uuid = crypto.randomUUID();
      await db.vaccines.add({ vaccineName: trimmed, uuid, updatedAt: new Date().toISOString() });
      await db.syncQueue.add({
        id: crypto.randomUUID(),
        table: "vaccines",
        operation: "create",
        payload: { vaccineName: trimmed },
        uuid,
        createdAt: new Date().toISOString(),
      });
      await loadVaccines();
    },
    [loadVaccines]
  );

  const removeVaccine = useCallback(async (id: number) => {
    const record = await db.vaccines.get(id);
    await db.vaccines.delete(id);
    const uuid = record?.uuid || crypto.randomUUID();
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      table: "vaccines",
      operation: "delete",
      payload: null,
      uuid,
      createdAt: new Date().toISOString(),
    });
    await loadVaccines();
  }, [loadVaccines]);

  const normalizedVaccines = useMemo(() => {
    return [...vaccines].sort((a, b) =>
      a.vaccineName.localeCompare(b.vaccineName, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [vaccines]);

  return {
    vaccines: normalizedVaccines,
    loading,
    error,
    addVaccine,
    removeVaccine,
    reload: loadVaccines,
  };
}

