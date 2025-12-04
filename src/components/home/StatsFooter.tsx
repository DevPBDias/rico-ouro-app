"use client";

import { useAnimals } from "@/hooks/db/useAnimals";
import { useMatrizes } from "@/hooks/db/useMatrizes";
import { calculateAgeInMonths } from "@/utils/animalUtils";
import { FormatData } from "@/utils/formatDates";
import { useMemo } from "react";

export function StatsFooter() {
  const { animals } = useAnimals();
  const { matrizes } = useMatrizes();

  const stats = useMemo(() => {
    const counts = {
      total: 0,
      male: { range1: 0, range2: 0, range3: 0, range4: 0, total: 0 },
      female: { range1: 0, range2: 0, range3: 0, range4: 0, total: 0 },
    };

    animals?.forEach((animal) => {
      const months = calculateAgeInMonths(animal.animal.nasc);
      const sex = animal.animal.sexo?.toUpperCase();

      if (sex === "M") {
        counts.male.total++;
        if (months <= 12) counts.male.range1++;
        else if (months <= 24) counts.male.range2++;
        else if (months <= 36) counts.male.range3++;
        else counts.male.range4++;
      } else if (sex === "F") {
        counts.female.total++;
        if (months <= 12) counts.female.range1++;
        else if (months <= 24) counts.female.range2++;
      }
    });

    matrizes?.forEach((matriz) => {
      const months = calculateAgeInMonths(FormatData(matriz.nasc));

      counts.female.total++;
      if (months >= 25 && months <= 36) counts.female.range3++;
      else if (months > 36) counts.female.range4++;
    });

    counts.total = counts.male.total + counts.female.total;

    return counts;
  }, [animals, matrizes]);

  const StatCard = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/50 bg-transparent py-2 px-1 shadow-sm">
      <span className="text-2xl font-black leading-none text-[#FFC107]">
        {value}
      </span>
      <span className="text-[11px] font-medium leading-none text-white opacity-90">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-3 px-4">
      <div className="flex w-full items-center justify-between rounded-xl border border-white bg-transparent px-4 py-2 shadow-sm backdrop-blur-md">
        <span className="text-sm font-medium text-white">Total Animais</span>
        <span className="text-4xl font-black text-[#FFC107]">
          {stats.total}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center justify-between border-b border-white/30 pb-1">
            <span className="text-xs font-bold text-white">Machos</span>
            <span className="text-sm font-bold text-[#FFC107]">
              {stats.male.total}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <StatCard value={stats.male.range1} label="0 - 12 m" />
            <StatCard value={stats.male.range2} label="13 - 24 m" />
            <StatCard value={stats.male.range3} label="25 - 36 m" />
            <StatCard value={stats.male.range4} label="+ 36 m" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center justify-between border-b border-white/30 pb-1">
            <span className="text-xs font-bold text-white">Fêmeas</span>
            <span className="text-sm font-bold text-[#FFC107]">
              {stats.female.total}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <StatCard value={stats.female.range1} label="0 - 12 m" />
            <StatCard value={stats.female.range2} label="13 - 24 m" />
            <StatCard value={stats.female.range3} label="25 - 36 m" />
            <StatCard value={stats.female.range4} label="+ 36 m" />
          </div>
        </div>
      </div>
    </div>
  );
}
