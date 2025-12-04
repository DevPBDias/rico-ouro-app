"use client";

import { use, useState } from "react";
import Header from "@/components/layout/Header";
import { useMatrizDetail } from "@/hooks/useMatrizDetail";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateAgeInMonths,
  calculateAnimalStage,
} from "@/utils/animalUtils";
import { FormatData } from "@/utils/formatDates";

const DetailsMatrizPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user } = useAuth();

  const { matriz, isLoading, vacinas } = useMatrizDetail(id);

  if (isLoading) return <p className="p-4">Carregando...</p>;
  if (!matriz) return <p className="p-4">Matriz não encontrada</p>;

  // Função auxiliar para garantir data válida para cálculos
  // Tenta converter DD/MM/YYYY para ISO se necessário, ou retorna a string original
  const getValidDateForCalculation = (dateStr: string | undefined | null) => {
    if (!dateStr) return undefined;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const validDate = getValidDateForCalculation(matriz.nasc);

  return (
    <main>
      <Header title={`${matriz.serieRGD || ""} ${matriz.rgn}`} />

      <section className="p-4 mt-4">
        <div className="flex flex-row justify-between items-end gap-2 mb-3 border-b-2 border-[#1162AE] pb-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-gray-400 text-sm font-medium uppercase">
              fazenda
            </span>
            <p className="font-bold uppercase text-lg text-[#1162AE]">
              {matriz.farm || "SEM DADO"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Categoria
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {calculateAnimalStage(validDate, matriz.sexo)}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.nasc}
                <span className="text-xs text-gray-500 ml-1">
                  ({calculateAgeInMonths(validDate)}m)
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.iabcgz ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.deca ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                F%
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.f ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                P%
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.p ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Status
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {(matriz.status as any)?.value ||
                  (typeof matriz.status === "string" ? matriz.status : "-")}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.sexo === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>
          </div>

          <div className="md:col-span-3 mt-4">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Vacinas:
            </span>
            <ul className="list-disc list-inside mt-1">
              {vacinas && vacinas.length > 0 ? (
                vacinas.map((vacina, index) => (
                  <li
                    className="font-bold uppercase text-[#1162AE]"
                    key={index}
                  >
                    {vacina.nome} - {vacina.data}
                  </li>
                ))
              ) : (
                <span className="font-bold uppercase text-[#1162AE]">
                  Sem vacinas anotadas
                </span>
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DetailsMatrizPage;
