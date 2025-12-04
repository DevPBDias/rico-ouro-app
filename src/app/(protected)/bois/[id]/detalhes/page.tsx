"use client";

import { use } from "react";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatDate } from "@/utils/formatDates";

const DetailsAnimalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user } = useAuth();

  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();

  const isLoading = animalLoading || vaccinesLoading || allVaccinesLoading;

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
        <div className="flex flex-row justify-between items-end gap-2 mb-3 border-b-2 border-[#1162AE] pb-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-gray-400 text-sm font-medium uppercase">
              RGN
            </span>
            <p className="font-bold uppercase text-lg text-[#1162AE]">
              {animal.rgn}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.sex === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>

            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.born_date ? formatDate(animal.born_date) : "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.iabcgz ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.deca ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Pai
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.father_name ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
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
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                P%
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.p ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                avô MATERNO
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.maternal_grandfather_name ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                F%
              </span>
              <span className="font-bold uppercase text-[#1162AE]">
                {animal.f ?? "-"}
              </span>
            </div>

            <div className="font-normal text-black flex flex-col gap-1">
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
