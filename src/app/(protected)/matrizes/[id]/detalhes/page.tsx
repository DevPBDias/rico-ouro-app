"use client";

import { use, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import {
  calculateAgeInMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { formatDate } from "@/utils/formatDates";
import DetailsInformation from "@/components/cards/DetailsInformation";
import { useFarms } from "@/hooks/db/farms/useFarms";

const DetailsMatrizPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { matriz, isLoading: matrizLoading } = useMatrizById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const { farms } = useFarms();
  const isLoading = matrizLoading || vaccinesLoading || allVaccinesLoading;

  const farmName = useMemo(() => {
    if (!matriz?.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === matriz.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [matriz?.farm_id, farms]);

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
  const mother_name = `${matriz.mother_serie_rgd || ""} ${
    matriz.mother_rgn || ""
  }`;

  return (
    <main>
      <Header title={`${matriz.serie_rgd || ""} ${matriz.rgn}`} />

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
              {Math.floor(ageInMonths / 12)}
              <span className="text-xs lowercase text-gray-500 ml-1">
                {Math.floor(ageInMonths / 12) === 1 ? "ano" : "anos"} e
              </span>{" "}
              {ageInMonths % 12}
              <span className="text-xs lowercase text-gray-500 ml-1">
                {ageInMonths % 12 === 1 ? "mes" : "meses"}
              </span>
            </p>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Categoria
            </span>
            <p className="font-bold uppercase text-[#1162AE] text-sm">
              {getAgeRange(ageInMonths)}
              <span className="text-xs text-gray-500 ml-1">
                ({ageInMonths}m)
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <DetailsInformation
              label="Nascimento"
              value={formatDate(matriz.born_date)}
            />
            <DetailsInformation label="Genotipagem" value={matriz.genotyping} />
          </div>

          <div className="grid grid-cols-4 items-start mb-2 gap-10">
            <DetailsInformation label="iABCZg" value={matriz.iabcgz} />
            <DetailsInformation label="DECA" value={matriz.deca} />
            <DetailsInformation label="F%" value={matriz.f} />
            <DetailsInformation label="P%" value={matriz.p} />
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <DetailsInformation label="Pai" value={matriz.father_name} />
            <DetailsInformation label="Mãe" value={mother_name} />
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <DetailsInformation
              label="Avô Materno"
              value={matriz.maternal_grandfather_name}
            />
            <DetailsInformation label="Status" value={matriz.status} />
          </div>

          <div className="grid grid-cols-2 items-center gap-20">
            <DetailsInformation label="Classe" value={matriz.classification} />
            <DetailsInformation label="Tipo" value={matriz.type} />
          </div>

          <div className="md:col-span-3 mt-2">
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
