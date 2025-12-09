"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Animal } from "@/types/animal.type";
import {
  calculateAgeInMonths as getAgeMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { formatDate } from "@/utils/formatDates";
import { useFarms } from "@/hooks/db/farms/useFarms";

interface AnimalCardProps {
  animal: Animal;
  type: "bois" | "matrizes";
}

export function AnimalCard({ animal, type }: AnimalCardProps) {
  const { farms } = useFarms();
  const getMonths = getAgeMonths(animal.born_date);

  const farmName = useMemo(() => {
    if (!animal.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === animal.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [animal.farm_id, farms]);

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      <section className="px-4 py-2 mt-2">
        <div className="flex flex-row justify-between items-start">
          <h4 className="font-bold text-lg text-[#1162AE]">
            {animal.serie_rgd} {animal.rgn}
          </h4>
          <Link
            className="flex flex-row items-start gap-1 text-white bg-[#1162AE] text-xs font-medium uppercase px-2 py-1 rounded-md px-4 py-2"
            href={`/${type}/${animal.rgn}`}
          >
            <Eye size={18} color="white" />
            Detalhes
          </Link>
        </div>
        <div className="flex flex-col justify-center items-start border-b-2 border-[#1162AE] pb-2">
          <div>
            <div className="flex flex-row gap-1 items-center">
              <span className="text-gray-400 text-xs font-medium uppercase">
                fazenda
              </span>
              <p className="font-bold uppercase text-lg text-[#1162AE] text-sm">
                {farmName}
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Idade
              </span>
              <p className="font-bold uppercase text-lg text-[#1162AE] text-sm">
                {Math.floor(getMonths / 12)}
                <span className="text-xs lowercase text-gray-500 ml-1">
                  {Math.floor(getMonths / 12) === 1 ? "ano" : "anos"} e
                </span>{" "}
                {getMonths % 12}
                <span className="text-xs lowercase text-gray-500 ml-1">
                  {getMonths % 12 === 1 ? "mes" : "meses"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-1 items-start">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Categoria
            </span>
            <p className="font-bold uppercase text-[#1162AE] text-sm">
              {getAgeRange(getMonths)}
              <span className="text-xs text-gray-500 ml-1">({getMonths}m)</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="flex flex-row items-start justify-between mb-2">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                status
              </span>
              <p className="font-bold uppercase text-lg text-[#1162AE] text-sm">
                {animal.status || "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.sex === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {formatDate(animal.born_date) ?? "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Nome
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.name ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.iabcgz ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.deca ?? "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                F%
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.f ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                P%
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.p ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Cor
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.born_color ?? "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Pai
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.father_name ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Mãe
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {`${animal.mother_serie_rgd ?? "-"} ${
                  animal.mother_rgn ?? ""
                }`.trim()}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                avô MATERNO
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.maternal_grandfather_name ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Tipo
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {animal.type ?? "-"}
              </span>
            </div>
          </div>

          {(animal.classification ||
            animal.type ||
            animal.genotyping ||
            animal.condition) && (
            <div className="flex flex-row items-start justify-between mb-2 gap-4">
              {animal.classification && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs font-medium uppercase">
                    Classe
                  </span>
                  <span className="font-bold uppercase text-[#1162AE] text-sm">
                    {animal.classification}
                  </span>
                </div>
              )}
              {animal.type && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs font-medium uppercase">
                    Tipo
                  </span>
                  <span className="font-bold uppercase text-[#1162AE] text-sm">
                    {animal.type}
                  </span>
                </div>
              )}
              {animal.genotyping && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs font-medium uppercase">
                    Genotipagem
                  </span>
                  <span className="font-bold uppercase text-[#1162AE] text-sm">
                    {animal.genotyping}
                  </span>
                </div>
              )}
              {animal.condition && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 text-xs font-medium uppercase">
                    Condição
                  </span>
                  <span className="font-bold uppercase text-[#1162AE] text-sm">
                    {animal.condition}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
