"use client";

import { MatrizDocType } from "@/types/database.types";
import {
  calculateAgeInMonths,
  calculateAnimalStage,
} from "@/utils/animalUtils";
import { FormatData } from "@/utils/formatDates";
import { Eye } from "lucide-react";
import Link from "next/link";

interface MatrizCardProps {
  data: MatrizDocType;
}

export function MatrizCard({ data }: MatrizCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 w-full">
      <section className="px-4 py-2 mt-2">
        <div className="flex flex-row justify-between items-center">
          <h4 className="font-bold text-lg text-[#1162AE]">
            {data.serieRGD} {data.rgn}
          </h4>
          <Link
            className="flex flex-row items-center gap-1 text-white bg-[#1162AE] text-xs font-medium uppercase px-2 py-1 rounded-md px-4 py-2"
            href={`/matrizes/${data.uuid}`}
          >
            <Eye size={18} color="white" />
            Detalhes
          </Link>
        </div>
        <div className="flex flex-col justify-center items-start border-b-2 border-[#1162AE] pb-2">
          <div className="flex flex-row gap-1 items-center">
            <span className="text-gray-400 text-xs font-medium uppercase">
              fazenda
            </span>
            <p className="font-bold uppercase text-lg text-[#1162AE] text-sm">
              {data.farm || "SEM DADO"}
            </p>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Categoria
            </span>
            <span className="font-bold uppercase text-[#1162AE] text-sm">
              {calculateAnimalStage(FormatData(data.nasc), data.sexo)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="flex flex-row items-start justify-between mb-2">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                status
              </span>
              <p className="font-bold uppercase text-lg text-[#1162AE] text-sm">
                {data.status || "-"}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.sexo === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.nasc ?? "-"}
                <span className="text-xs text-gray-500 ml-1">
                  ({calculateAgeInMonths(FormatData(data.nasc))}m)
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-row items-start justify-between mb-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.iabcgz ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                Status
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.status ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.deca ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                F%
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.f ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-medium uppercase">
                P%
              </span>
              <span className="font-bold uppercase text-[#1162AE] text-sm">
                {data.p ?? "-"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start justify-start">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Vacinas:
            </span>
            <ul className="list-disc list-inside mt-1">
              {data.vacinas && data.vacinas.length > 0 ? (
                data.vacinas.map((vacina, index) => (
                  <li
                    className="font-bold uppercase text-[#1162AE] text-sm"
                    key={index}
                  >
                    {vacina.nome} - {vacina.data}
                  </li>
                ))
              ) : (
                <span className="font-bold uppercase text-[#1162AE] text-sm">
                  Sem vacinas anotadas
                </span>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
