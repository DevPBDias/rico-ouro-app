"use client";

import { use, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { formatDate } from "@/utils/formatDates";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { calculateAgeInMonths as getAgeMonths } from "@/hooks/utils/useAnimalsByAgeAndSex";

const DetailsAnimalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const isLoading = animalLoading || vaccinesLoading || allVaccinesLoading;
  const { farms } = useFarms();
  const getMonths = getAgeMonths(animal?.born_date);

  const farmName = useMemo(() => {
    if (!animal?.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === animal.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [animal?.farm_id, farms]);

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando dados do animal...</p>
        </div>
      </main>
    );
  }

  if (!animal) {
    return (
      <main>
        <Header title="Não encontrado" />
        <div className="p-4 text-center">
          <p>Animal não encontrado</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header title={`${animal.serie_rgd || ""} ${animal.rgn}`} />

      <section className="p-4 mt-4">
        <div className="flex flex-col justify-start items-start mb-3 border-b-2 border-[#1162AE] pb-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Fazenda
            </span>
            <p className="font-bold uppercase text-lg text-[#1162AE]">
              {farmName}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Idade
            </span>
            <p className="font-bold uppercase text-sm text-[#1162AE]">
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

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.sex === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.born_date ? formatDate(animal.born_date) : "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.iabcgz ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.deca ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Pai
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.father_name ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Mãe
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.mother_serie_rgd && animal.mother_rgn
                  ? `${animal.mother_serie_rgd} ${animal.mother_rgn}`
                  : "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start justify-start mb-2 gap-20">
            <div className="grid grid-cols-2 items-start justify-start mb-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm font-medium uppercase">
                  P%
                </span>
                <span className="font-bold uppercase text-[#1162AE]">
                  {animal.p ?? "-"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-sm font-medium uppercase">
                  F%
                </span>
                <span className="font-bold uppercase text-[#1162AE]">
                  {animal.f ?? "-"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                avô MATERNO
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.maternal_grandfather_name ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Classe
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.classification ?? "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Status
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.status ?? "-"}
              </span>
            </div>
          </div>

          <div className="md:col-span-3">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Vacinas:
            </span>
            <ul className="list-disc list-inside mt-1">
              {(() => {
                // Create a map of vaccine_id to vaccine_name for quick lookup
                const vaccineMap = new Map(
                  vaccines.map((v) => [v.id, v.vaccine_name])
                );

                // Join animal vaccines with vaccine names
                const vaccinesWithNames = animalVaccines
                  .map((av) => ({
                    ...av,
                    name: vaccineMap.get(av.vaccine_id),
                  }))
                  .filter((av) => av.name); // Only show vaccines that have a matching name

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

export default DetailsAnimalPage;
