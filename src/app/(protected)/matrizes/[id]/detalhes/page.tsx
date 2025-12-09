"use client";

import { use, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import {
  calculateAgeInMonths as getAgeMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { ChartLineLabel } from "@/components/charts/BoiCharts";
import { useAnimalWeights } from "@/hooks/db/animal_weights";
import InfoRow from "@/components/layout/InfoRow";
import InfoSection from "@/components/layout/InfoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/formatDates";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";

const DetailsMatrizPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { matriz, isLoading: matrizLoading } = useMatrizById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const isLoading = matrizLoading || vaccinesLoading || allVaccinesLoading;
  const { farms } = useFarms();
  const getMonths = getAgeMonths(matriz?.born_date);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(
    id ?? undefined
  );

  // Transformar dados para o formato do gráfico
  const weightData = (weights || []).map((w) => ({
    date: w.date,
    value: w.value,
  }));

  const farmName = useMemo(() => {
    if (!matriz?.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === matriz.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [matriz?.farm_id, farms]);

  const mother_name = `${matriz?.mother_serie_rgd || ""} ${
    matriz?.mother_rgn || ""
  }`;

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

  return (
    <main>
      <Header title={`${matriz.serie_rgd || ""} ${matriz.rgn}`} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-6">
          <div>
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-6 h-auto gap-1 shadow-sm">
                <TabsTrigger
                  value="dados"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase">Dados</span>
                </TabsTrigger>
                <TabsTrigger
                  value="vaccines"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase">Vacinas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pesagem-list"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase">Histórico</span>
                </TabsTrigger>
                <TabsTrigger
                  value="graphics"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase">Gráficos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="dados"
                className="mt-0 space-y-6 animate-in fade-in-0 duration-200"
              >
                <InfoSection title="Dados Básicos">
                  <InfoRow label="Fazenda" value={farmName} />
                  <InfoRow label="Idade" value={getMonths} />
                  <InfoRow label="Categoria" value={getAgeRange(getMonths)} />
                </InfoSection>

                <InfoSection title="Identificação">
                  <InfoRow label="Nascimento" value={matriz?.born_date} />
                  <InfoRow label="IABCZG" value={matriz?.iabcgz} />
                  <InfoRow label="Deca" value={matriz?.deca} />
                </InfoSection>

                <InfoSection title="Índices Genéticos">
                  <InfoRow label="F%" value={matriz?.f} />
                  <InfoRow label="P%" value={matriz?.p} />
                  <InfoRow label="COR" value={matriz?.born_color} />
                </InfoSection>

                <InfoSection title="Genealogia">
                  <InfoRow label="Pai" value={matriz?.father_name} />
                  <InfoRow label="Mãe" value={mother_name} />
                  <InfoRow
                    label="Avó Materno"
                    value={matriz?.maternal_grandfather_name}
                  />
                </InfoSection>

                <InfoSection title="Classificação">
                  <InfoRow label="Classe" value={matriz?.classification} />
                  <InfoRow label="Genotipagem" value={matriz?.genotyping} />
                  <InfoRow label="Status" value={matriz?.status} />
                  <InfoRow label="Tipo" value={matriz?.type} />
                </InfoSection>
              </TabsContent>

              <TabsContent
                value="vaccines"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="md:col-span-3 mt-2">
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
                        <InfoSection title="Vacinação">
                          <div className="px-4 py-3 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-sm font-semibold text-red-500">
                              ⚠️ SEM VACINAS ANOTADAS
                            </p>
                          </div>
                        </InfoSection>
                      );
                    })()}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent
                value="pesagem-list"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <div className="space-y-3 w-full">
                  <DetailsWeightList weightData={weightData} gainDaily={[]} />

                  {weightData.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 w-full">
                      <p className="text-gray-500 text-sm">
                        Nenhum peso registrado
                      </p>
                      <Link
                        className="w-full bg-primary text-center py-2.5 uppercase text-white text-sm font-semibold rounded-lg"
                        href="/pesagem-ce"
                      >
                        + Pesagem
                      </Link>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="graphics"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <ChartLineLabel
                  title="Pesos"
                  description="Evolução mensal"
                  data={weightData}
                  colorVar="--chart-1"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetailsMatrizPage;
