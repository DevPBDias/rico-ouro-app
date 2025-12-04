"use client";

import { use } from "react";
import Header from "@/components/layout/Header";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import {
  calculateAgeInMonths,
  calculateAnimalStage,
} from "@/utils/animalUtils";
import { formatDate } from "@/utils/formatDates";
import { getAgeRange } from "@/hooks/utils/useAnimalsByAgeAndSex";

const DetailsMatrizPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { matriz, isLoading: matrizLoading } = useMatrizById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();

  const isLoading = matrizLoading || vaccinesLoading || allVaccinesLoading;

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando dados da matriz...</p>
        </div>
      </main>
    );
  }

  if (!matriz) {
    return (
      <main>
        <Header title="Não encontrado" />
        <div className="p-4 text-center">
          <p>Matriz não encontrada</p>
        </div>
      </main>
    );
  }

  const ageInMonths = calculateAgeInMonths(matriz.born_date);

  return (
    <main>
      <Header title={`${matriz.serie_rgd || ""} ${matriz.rgn}`} />

      <section className="p-4 mt-4">
        <div className="flex flex-row justify-between items-end gap-2 mb-3 border-b-2 border-[#1162AE] pb-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Fazenda
            </span>
            <p className="font-bold uppercase text-lg text-[#1162AE]">
              {matriz.farm_id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Categoria
              </span>
              <p className="font-bold uppercase text-[#1162AE]">
                {getAgeRange(ageInMonths)}
                <span className="text-xs text-gray-500 ml-1">
                  ({ageInMonths}m)
                </span>
              </p>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.born_date ? formatDate(matriz.born_date) : "-"}
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
                Pai
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.father_name ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Mãe
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.mother_serie_rgd ?? "-"} {matriz.mother_rgn ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Status
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.status ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Avô Materno
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {matriz.maternal_grandfather_name ?? "-"}
              </span>
            </div>
          </div>

          <div className="md:col-span-3 mt-4">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Vacinas:
            </span>
            <ul className="list-disc list-inside mt-1">
              {(() => {
                const vaccineMap = new Map(
                  vaccines.map((v) => [v.id, v.vaccine_name])
                );

                const vaccinesWithNames = animalVaccines
                  .map((av) => ({
                    ...av,
                    name: vaccineMap.get(av.vaccine_id),
                  }))
                  .filter((av) => av.name);

                return vaccinesWithNames.length > 0 ? (
                  vaccinesWithNames.map((vaccine) => (
                    <li
                      className="font-bold uppercase text-[#1162AE]"
                      key={vaccine.id}
                    >
                      {vaccine.name} -{" "}
                      {vaccine.date ? formatDate(vaccine.date) : "-"}
                    </li>
                  ))
                ) : (
                  <span className="font-bold uppercase text-[#1162AE]">
                    Sem vacinas anotadas
                  </span>
                );
              })()}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DetailsMatrizPage;
