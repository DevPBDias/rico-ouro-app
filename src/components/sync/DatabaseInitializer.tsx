"use client";

import { useEffect } from "react";
import { seedFarms, seedVaccines } from "@/lib/db";

export default function DatabaseInitializer() {
  useEffect(() => {
    // Inicializa vacinas e fazendas do Supabase (ou constantes como fallback)
    Promise.all([
      seedVaccines().catch((error) => {
        console.error("Erro ao inicializar vacinas:", error);
      }),
      seedFarms().catch((error) => {
        console.error("Erro ao inicializar fazendas:", error);
      }),
    ]);
  }, []);

  return null;
}

