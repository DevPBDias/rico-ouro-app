"use client";

import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useAnimalsByAgeAndSex } from "@/hooks/utils/useAnimalsByAgeAndSex";

export function StatsFooter() {
  const { animals } = useAnimals();
  const { total, male, female } = useAnimalsByAgeAndSex(animals);

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
        <span className="text-4xl font-black text-[#FFC107]">{total.all}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center justify-between border-b border-white/30 pb-1">
            <span className="text-xs font-bold text-white">Machos</span>
            <span className="text-sm font-bold text-[#FFC107]">
              {total.male}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <StatCard value={male["0 - 12 m"].length} label="0 - 12 m" />
            <StatCard value={male["13 - 24 m"].length} label="13 - 24 m" />
            <StatCard value={male["25 - 36 m"].length} label="25 - 36 m" />
            <StatCard value={male["+37 m"].length} label="+37 m" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="mb-1 flex items-center justify-between border-b border-white/30 pb-1">
            <span className="text-xs font-bold text-white">Fêmeas</span>
            <span className="text-sm font-bold text-[#FFC107]">
              {total.female}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <StatCard value={female["0 - 12 m"].length} label="0 - 12 m" />
            <StatCard value={female["13 - 24 m"].length} label="13 - 24 m" />
            <StatCard value={female["25 - 36 m"].length} label="25 - 36 m" />
            <StatCard value={female["+37 m"].length} label="+37 m" />
          </div>
        </div>
      </div>
    </div>
  );
}
