"use client";

import { use, useMemo } from "react";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import {
  calculateAgeInMonths as getAgeMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { ChartLineLabel } from "@/components/charts/BoiCharts";
import { useAnimalWeights } from "@/hooks/db/animal_weights";
import { useAnimalCE } from "@/hooks/db/animal_ce";
import InfoSection from "@/components/layout/InfoSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/formatDates";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";
import { DetailsCircunfList } from "@/components/lists/DetailsCircunfList";

const DetailsAnimalPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(id);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const isLoading = animalLoading || vaccinesLoading || allVaccinesLoading;
  const { farms } = useFarms();
  const getMonths = getAgeMonths(animal?.born_date);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(
    id ?? undefined
  );
  const { metrics: ceMetrics, isLoading: ceLoading } = useAnimalCE(
    id ?? undefined
  );

  // Transformar dados para o formato do gráfico
  const weightData = (weights || []).map((w) => ({
    date: w.date,
    value: w.value,
  }));

  const ceData = (ceMetrics || []).map((ce) => ({
    date: ce.date,
    value: ce.value,
  }));

  const farmName = useMemo(() => {
    if (!animal?.farm_id) return "SEM DADO";
    const farm = farms.find((f) => f.id === animal.farm_id);
    return farm ? farm.farm_name : "SEM DADO";
  }, [animal?.farm_id, farms]);

  const mother_name = `${animal?.mother_serie_rgd || ""} ${
    animal?.mother_rgn || ""
  }`;

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
                  value="pesagem-ce-list"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase">Medidas</span>
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
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="grid grid-cols-1 gap-y-1.5">
                  <div className="space-y-1">
                    <div className="bg-card border border-border rounded-lg p-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Dados Básicos
                      </h3>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Fazenda
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {farmName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Nascimento
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.born_date}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Idade
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {Math.floor(getMonths / 12)}{" "}
                          {Math.floor(getMonths / 12) === 1 ? "ano" : "anos"} e{" "}
                          {getMonths % 12}{" "}
                          {getMonths % 12 === 1 ? "mês" : "meses"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Categoria
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {getAgeRange(getMonths)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          SEXO
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.sex}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 grid grid-cols-1 gap-x-4">
                    <div className="bg-card border border-border rounded-lg p-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Índices Genéticos
                      </h3>
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase block">
                            F%
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {animal?.f}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase block">
                            P%
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {animal?.p}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase">
                            IABCZG
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {animal?.iabcgz}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[10px] text-gray-500 uppercase">
                            Deca
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {animal?.deca}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="bg-card border border-border rounded-lg p-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Genealogia
                      </h3>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          pai
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.father_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Mãe
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {mother_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Avô Materno
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.maternal_grandfather_name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 grid grid-cols-1 gap-x-4">
                      <div className="bg-card border border-border rounded-lg p-3">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Classificação
                        </h3>
                        <div className="flex flex-col justify-start items-start gap-2">
                          <div className="grid grid-cols-2 gap-8 w-full">
                            <div className="flex flex-col justify-start items-start">
                              <span className="text-[11px] text-gray-500 uppercase block">
                                Classe
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                {animal?.classification}
                              </span>
                            </div>
                            <div className="flex flex-col justify-start items-start">
                              <span className="text-[11px] text-gray-500 uppercase block">
                                Genotipagem
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                {animal?.genotyping}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-8 w-full">
                            <div className="flex flex-col justify-start items-start">
                              <span className="text-[11px] text-gray-500 uppercase">
                                Status
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                {animal?.status}
                              </span>
                            </div>
                            <div className="flex flex-col justify-start items-start">
                              <span className="text-[10px] text-gray-500 uppercase">
                                Tipo
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                {animal?.type || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                value="pesagem-ce-list"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <Tabs defaultValue="weight" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 -mb-3 h-auto gap-1 shadow-sm">
                    <TabsTrigger
                      value="weight"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Pesagem</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="ce"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Per. Escrotal</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="weight"
                    className="mt-0 animate-in fade-in-0 duration-200"
                  >
                    <div className="space-y-3 w-full">
                      <DetailsWeightList
                        weightData={weightData}
                        gainDaily={[]}
                      />

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
                    value="ce"
                    className="mt-0 space-y-6 animate-in fade-in-0 duration-200"
                  >
                    <div className="space-y-3 w-full">
                      <DetailsCircunfList CEMedidos={ceMetrics} />

                      {ceMetrics.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 w-full">
                          <p className="text-gray-500 text-sm">
                            Nenhum peso registrado
                          </p>
                          <Link
                            className="w-full bg-primary text-center py-2.5 uppercase text-white text-sm font-semibold rounded-lg"
                            href="/pesagem-ce"
                          >
                            + Per. Escrotal
                          </Link>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent
                value="graphics"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <Tabs defaultValue="graphic-weight" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-3 h-auto gap-1 shadow-sm">
                    <TabsTrigger
                      value="graphic-weight"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Pesagem</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="graphic-ce"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Per. Escrotal</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="border-t border-border pt-3"></div>

                  <TabsContent
                    value="graphic-weight"
                    className="mt-0 space-y-6 animate-in fade-in-0 duration-200"
                  >
                    <ChartLineLabel
                      title="Pesos"
                      description="Evolução mensal"
                      data={weightData}
                      colorVar="--chart-1"
                    />
                  </TabsContent>

                  <TabsContent
                    value="graphic-ce"
                    className="mt-0 space-y-6 animate-in fade-in-0 duration-200"
                  >
                    <ChartLineLabel
                      title="Circunferência Escrotal"
                      description="Evolução mensal"
                      data={ceData}
                      colorVar="--chart-2"
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetailsAnimalPage;
