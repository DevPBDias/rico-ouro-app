"use client";

import { useState, useMemo } from "react";
import { StandardTabList } from "@/components/ui/StandardTabList";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useDeleteAnimalVaccine } from "@/hooks/db/animal_vaccines/useDeleteAnimalVaccine";
import {
  Trash2,
  Syringe,
  Calendar,
  AlertCircle,
  LineChart,
  ClipboardList,
  VenusAndMars,
  RulerDimensionLine,
  History,
} from "lucide-react";
import { DetailsMovementList } from "@/components/movements/DetailsMovementList";
import {
  calculateAgeInMonths as getAgeMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { ChartLineLabel } from "@/components/charts/BoiCharts";
import { useAnimalWeights } from "@/hooks/db/animal_weights";
import { useAnimalCE } from "@/hooks/db/animal_ce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/formatDates";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";
import { DetailsCircunfList } from "@/components/lists/DetailsCircunfList";
import { DetailsSkeleton } from "@/components/skeletons/DetailsSkeleton";
import { cn } from "@/lib/utils";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { Accordion } from "@/components/ui/accordion";
import { EditReproductionModal } from "@/components/modals/reproduction/EditReproductionModal";
import { DeleteReproductionModal } from "@/components/modals/reproduction/DeleteReproductionModal";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReproductionEventCard } from "../cards/ReproductionEventCard";

const DetailsAnimalLayout = ({ rgn }: { rgn: string }) => {
  const { animal, isLoading: animalLoading } = useAnimalById(rgn);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(rgn);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const { deleteAnimalVaccine, isLoading: isDeleting } =
    useDeleteAnimalVaccine();
  const isLoading = animalLoading || vaccinesLoading || allVaccinesLoading;
  const { farms } = useFarms();
  const getMonths = getAgeMonths(animal?.born_date);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(
    rgn ?? undefined,
  );
  const { metrics: ceMetrics, isLoading: ceLoading } = useAnimalCE(
    rgn ?? undefined,
  );
  const { events: reproductionEvents, isLoading: reproductionLoading } =
    useReproductionEvents(rgn);

  const [activeTab, setActiveTab] = useState("dados");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ReproductionEvent | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ReproductionEvent | null>(
    null,
  );

  const [vaccineToDelete, setVaccineToDelete] = useState<string | null>(null);

  const handleEditReproduction = (event: ReproductionEvent) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteReproduction = (eventId: string) => {
    const event = reproductionEvents.find((e) => e.event_id === eventId);
    if (event) {
      setEventToDelete(event);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    try {
      await deleteAnimalVaccine(vaccineId);
      setVaccineToDelete(null);
    } catch (error) {
      console.error("Erro ao deletar vacina:", error);
    }
  };

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
    return <DetailsSkeleton />;
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
      <div className="flex-1 overflow-y-auto w-full">
        <div className="space-y-3 mt-2 w-full">
          <div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <StandardTabList
                tabs={[
                  { value: "dados", label: "Dados", icon: ClipboardList },
                  { value: "vaccines", label: "Vacinas", icon: Syringe },
                  {
                    value: "pesagem-ce-list",
                    label: "Medidas",
                    icon: RulerDimensionLine,
                  },
                  { value: "reproduction", label: "Repro", icon: VenusAndMars },
                  { value: "history", label: "Histórico", icon: History },
                  { value: "graphics", label: "Gráficos", icon: LineChart },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="mb-4"
              />
              <TabsContent
                value="dados"
                className="mt-0 animate-in fade-in-0 duration-200 w-full"
              >
                <div className="grid grid-cols-1 gap-y-1.5 w-full">
                  <div className="space-y-1 w-full">
                    <div className="bg-card border border-border rounded-lg px-3 py-2 w-full">
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
                          {formatDate(animal?.born_date)}
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
                      <div className="flex justify-between items-center pt-0.5 border-b border-border">
                        <span className="text-[11px] text-gray-500 uppercase">
                          SEXO
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.sex}
                        </span>
                      </div>
                      {animal?.sex === "F" && (
                        <div className="flex justify-between items-center pt-0.5 border-b border-border">
                          <span className="text-[11px] text-gray-500 uppercase">
                            Tipo
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {animal?.type || "-"}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          genotipagem
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.genotyping}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 grid grid-cols-1 gap-x-4">
                    <div className="bg-card border border-border rounded-lg px-3 py-1.5">
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

                  <div className="space-y-1 w-full">
                    <div className="bg-card border border-border rounded-lg px-3 py-2">
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
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Avô Materno
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.maternal_grandfather_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Avô Paterno
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {animal?.paternal_grandfather_name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 grid grid-cols-1 gap-x-4 w-full">
                      <div className="bg-card border border-border rounded-lg px-3 py-2 w-full">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Outras informações
                        </h3>
                        <div className="grid grid-cols-2 gap-4 justify-between items-start w-full">
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase block">
                              Classe
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {animal?.classification || "-"}
                            </span>
                          </div>

                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase">
                              Status
                            </span>
                            <div className="flex flex-col">
                              {animal?.status?.split(" / ").map((s, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "font-semibold text-primary truncate max-w-[150px] text-xs",
                                  )}
                                >
                                  - {s}
                                </span>
                              )) || "-"}
                            </div>
                          </div>

                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase">
                              Situação
                            </span>
                            <div className="flex flex-col">
                              {animal?.document_situation
                                ?.split(" / ")
                                .map((s, idx) => (
                                  <span
                                    key={idx}
                                    className={cn(
                                      "font-semibold text-primary truncate max-w-[150px] text-xs",
                                    )}
                                  >
                                    {s}
                                  </span>
                                )) || "-"}
                            </div>
                          </div>

                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase">
                              Sociedade
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {animal?.partnership || "-"}
                            </span>
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
                <div className="space-y-3">
                  {(() => {
                    const vaccineMap = new Map(
                      vaccines.map((v) => [v.id, v.vaccine_name]),
                    );

                    const vaccinesWithNames = animalVaccines
                      .map((av) => ({
                        ...av,
                        name: vaccineMap.get(av.vaccine_id),
                      }))
                      .filter((av) => av.name);

                    return vaccinesWithNames.length > 0 ? (
                      <div className="space-y-2">
                        {vaccinesWithNames.map((vaccine) => (
                          <div
                            key={vaccine.id}
                            className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <Syringe className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate uppercase">
                                  {vaccine.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {vaccine.date
                                      ? formatDate(vaccine.date)
                                      : "Data não informada"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {vaccineToDelete === vaccine.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleDeleteVaccine(vaccine.id)
                                  }
                                  disabled={isDeleting}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                                >
                                  {isDeleting ? "..." : "Confirmar"}
                                </button>
                                <button
                                  onClick={() => setVaccineToDelete(null)}
                                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-md transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setVaccineToDelete(vaccine.id)}
                                className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Excluir vacina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Nenhuma vacina registrada
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Adicione vacinas para manter o histórico do animal
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
              <TabsContent
                value="pesagem-ce-list"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <Tabs defaultValue="weight" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-linear-to-r from-muted/50 to-muted/30 rounded-lg p-1 -mb-3 h-auto gap-1 shadow-sm">
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
                  <TabsList className="grid w-full grid-cols-2 bg-linear-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-3 h-auto gap-1 shadow-sm">
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
              <TabsContent
                value="reproduction"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                {reproductionEvents.length > 0 ? (
                  <div className="space-y-6">
                    {reproductionEvents.map((event) => (
                      <Accordion
                        key={event.event_id}
                        type="single"
                        collapsible
                        className="w-full"
                      >
                        <ReproductionEventCard
                          event={event}
                          matriz={animal as any}
                          onEdit={handleEditReproduction}
                          onDelete={handleDeleteReproduction}
                        />
                      </Accordion>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                      Nenhum evento de reprodução registrado
                    </p>
                    <Link
                      className="bg-primary text-primary-foreground text-center py-2.5 px-6 uppercase text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                      href="/reproducao"
                    >
                      + Novo Evento
                    </Link>
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="history"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <DetailsMovementList rgn={rgn} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {eventToEdit && (
        <EditReproductionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEventToEdit(null);
          }}
          event={eventToEdit}
        />
      )}

      {eventToDelete && (
        <DeleteReproductionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setEventToDelete(null);
          }}
          event={eventToDelete}
        />
      )}
    </main>
  );
};

export default DetailsAnimalLayout;
