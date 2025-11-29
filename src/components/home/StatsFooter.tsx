"use client";

import { useAnimals } from "@/hooks/db/useAnimals";
import { calculateAnimalStage } from "@/utils/animalUtils";
import { useMemo } from "react";

export function StatsFooter() {
  const { animals } = useAnimals();

  const stats = useMemo(() => {
    const counts = {
      total: animals?.length || 0,
      bezerros: 0,
      touros: 0,
      matrizes: 0,
    };

    animals?.forEach((animal) => {
      const stage = calculateAnimalStage(
        animal.animal.nasc,
        animal.animal.sexo
      );

      if (stage === "Bezerro") {
        counts.bezerros++;
      } else if (stage === "Touro") {
        counts.touros++;
      } else if (stage === "Matriz") {
        counts.matrizes++;
      }
    });

    return counts;
  }, [animals]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 grid grid-cols-2 justify-center gap-2 text-white z-10 px-2 overflow-x-auto">
      <div className="bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 flex flex-row items-center gap-1 min-w-[90px]">
        <span className="font-bold text-sm">{stats.total}</span>
        <span className="text-[10px] uppercase opacity-80">Animais</span>
      </div>
      <div className="bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 flex flex-row items-center gap-1 min-w-[90px]">
        <span className="font-bold text-sm">{stats.bezerros}</span>
        <span className="text-[10px] uppercase opacity-80">Bezerros</span>
      </div>
      <div className="bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 flex flex-row items-center gap-1 min-w-[90px]">
        <span className="font-bold text-sm">{stats.touros}</span>
        <span className="text-[10px] uppercase opacity-80">Touros</span>
      </div>
      <div className="bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 flex flex-row items-center gap-1 min-w-[90px]">
        <span className="font-bold text-sm">{stats.matrizes}</span>
        <span className="text-[10px] uppercase opacity-80">Matrizes</span>
      </div>
    </div>
  );
}
