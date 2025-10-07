"use client";

import { useState, useEffect } from "react";
import { AnimalData } from "@/lib/db";

const RECENT_ANIMALS_KEY = "recent-animals";

export function useRecentAnimals() {
  const [recentAnimals, setRecentAnimals] = useState<AnimalData[]>([]);

  useEffect(() => {
    // Carrega animais recentes do localStorage
    const stored = localStorage.getItem(RECENT_ANIMALS_KEY);
    if (stored) {
      try {
        setRecentAnimals(JSON.parse(stored));
      } catch (error) {
        console.error("Erro ao carregar animais recentes:", error);
      }
    }
  }, []);

  const addRecentAnimal = (animal: AnimalData) => {
    setRecentAnimals((prev) => {
      // Remove se já existe
      const filtered = prev.filter((a) => a.id !== animal.id);
      // Adiciona no início
      const updated = [animal, ...filtered].slice(0, 5); // Mantém apenas 5

      // Salva no localStorage
      localStorage.setItem(RECENT_ANIMALS_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const clearRecentAnimals = () => {
    setRecentAnimals([]);
    localStorage.removeItem(RECENT_ANIMALS_KEY);
  };

  return {
    recentAnimals,
    addRecentAnimal,
    clearRecentAnimals,
  };
}
