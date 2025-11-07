import { useCallback, useEffect, useMemo, useState } from "react";

import { db, seedVaccines, type Vaccine } from "@/lib/db";

export function useVaccines() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVaccines = useCallback(async () => {
    const data = await db.vaccines.orderBy("vaccineName").toArray();
    setVaccines(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        await seedVaccines();
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
      if (!trimmed) {
        throw new Error("Informe o nome da vacina.");
      }

      const existing = await db.vaccines
        .where("vaccineName")
        .equals(trimmed)
        .first();

      const existsWithDifferentCase = !existing
        ? (await db.vaccines.toArray()).some(
            (item) =>
              item.vaccineName.trim().toLowerCase() === trimmed.toLowerCase()
          )
        : false;

      if (existing || existsWithDifferentCase) {
        throw new Error("Essa vacina já está cadastrada.");
      }

      const id = await db.vaccines.add({ vaccineName: trimmed });
      const added = await db.vaccines.get(id);
      if (added) {
        setVaccines((prev) =>
          [...prev, added].sort((a, b) =>
            a.vaccineName.localeCompare(b.vaccineName, "pt-BR", {
              sensitivity: "base",
            })
          )
        );
      }
    },
    []
  );

  const removeVaccine = useCallback(async (id: number) => {
    await db.vaccines.delete(id);
    setVaccines((prev) => prev.filter((vaccine) => vaccine.id !== id));
  }, []);

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

