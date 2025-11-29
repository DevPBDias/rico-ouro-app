"use client";

import { useAnimals } from "@/hooks/db/useAnimals";
import { useMatrizes } from "@/hooks/db/useMatrizes";

export function StatsFooter() {
  const { animals } = useAnimals();
  const { matrizes } = useMatrizes();

  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-white z-10 px-4">
      <div className="bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex flex-col items-center min-w-[100px]">
        <span className="font-bold text-xl">{animals?.length}</span>
        <span className="text-xs uppercase opacity-80">Animais</span>
      </div>
      <div className="bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex flex-col items-center min-w-[100px]">
        <span className="font-bold text-xl">{matrizes?.length || 0}</span>
        <span className="text-xs uppercase opacity-80">Matrizes</span>
      </div>
    </div>
  );
}
