"use client";

import {
  calculateAgeInMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Animal } from "@/types/animal.type";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useMemo } from "react";

interface SearchCardProps {
  animal: Animal;
  onDetailsClick?: () => void;
}

export default function SearchCard({
  animal,
  onDetailsClick,
}: SearchCardProps) {
  const { farms } = useFarms();

  const farmName = useMemo(() => {
    if (!animal.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === animal.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [animal.farm_id, farms]);

  const isFemale = animal?.sex === "F";
  const getMonths = calculateAgeInMonths(animal?.born_date);
  const animalAge = getMonths >= 25;
  const isMatriz = animalAge && isFemale;
  const pathName = isMatriz ? "matrizes" : "animals";

  const handleDetailsClick = (e: React.MouseEvent) => {
    if (onDetailsClick) {
      e.preventDefault();
      e.stopPropagation();
      onDetailsClick();
    }
  };

  return (
    <div className="relative w-full text-left bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="font-bold text-lg text-primary leading-tight">
              {animal?.serie_rgd} {animal?.rgn}
            </h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-20">
                Fazenda
              </span>
              <span className="text-sm font-medium text-primary">
                {farmName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-20">
                Status
              </span>
              <span className="text-sm font-medium text-primary">
                {animal?.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-20">
                Classe
              </span>
              <span className="text-sm font-medium text-primary">
                {animal?.classification}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-20">
                Categoria
              </span>
              <span className="text-sm font-medium text-primary">
                {getAgeRange(getMonths)}
                <span className="text-sm text-gray-500 ml-1">
                  ({getMonths}m)
                </span>
              </span>
            </div>
          </div>
        </div>

        {onDetailsClick ? (
          <button
            onClick={handleDetailsClick}
            className="absolute right-4 top-4 z-10 px-3 py-2 gap-1 bg-primary text-white text-[11px] font-semibold rounded-sm flex items-center hover:bg-primary/90 transition-colors"
          >
            Detalhes
            <ChevronRight size={16} color="white" />
          </button>
        ) : (
          <Link
            href={`/${pathName}/${animal?.rgn}/detalhes`}
            className="absolute right-4 top-4 z-10 px-3 py-2 gap-1 bg-primary text-white text-[11px] font-semibold rounded-sm flex items-center"
          >
            Detalhes
            <ChevronRight size={16} color="white" />
          </Link>
        )}
      </div>
    </div>
  );
}
