"use client";

import { useState, useMemo } from "react";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useDeleteAnimalVaccine } from "@/hooks/db/animal_vaccines/useDeleteAnimalVaccine";
import { Trash2, Syringe, Calendar, AlertCircle } from "lucide-react";
import {
  calculateAgeInMonths as getAgeMonths,
  getAgeRange,
} from "@/hooks/utils/useAnimalsByAgeAndSex";
import { ChartLineLabel } from "@/components/charts/BoiCharts";
import { useAnimalWeights } from "@/hooks/db/animal_weights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, parseToDate } from "@/utils/formatDates";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DetailsSkeleton } from "@/components/skeletons/DetailsSkeleton";
import { ReproductionEventCard } from "@/components/cards/ReproductionEventCard";
import { ReproductionIATFCard } from "@/components/cards/ReproductionIATFCard";
import { ReproductionEventListCard } from "@/components/cards/ReproductionEventListCard";
import { EditReproductionModal } from "@/components/modals/reproduction/EditReproductionModal";
import { DeleteReproductionModal } from "@/components/modals/reproduction/DeleteReproductionModal";
import { ReproductionEvent } from "@/types/reproduction_event.type";

const DetailsMatrizLayout = ({ rgn }: { rgn: string }) => {
  const { matriz, isLoading: matrizLoading } = useMatrizById(rgn);
  const { animalVaccines, isLoading: vaccinesLoading } = useAnimalVaccines(rgn);
  const { vaccines, isLoading: allVaccinesLoading } = useVaccines();
  const { deleteAnimalVaccine, isLoading: isDeleting } =
    useDeleteAnimalVaccine();
  const isLoading = matrizLoading || vaccinesLoading || allVaccinesLoading;
  const { farms } = useFarms();
  const getMonths = getAgeMonths(matriz?.born_date);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(
    rgn ?? undefined
  );
  const { events: reproductionEvents, isLoading: reproductionLoading } =
    useReproductionEvents(rgn);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ReproductionEvent | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ReproductionEvent | null>(
    null
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

  // Calcular ganho diário
  const gainDaily = useMemo(() => {
    if (!weights || weights.length < 2) return [];

    const sortedWeights = [...weights].sort(
      (a, b) =>
        (parseToDate(a.date)?.getTime() || 0) -
        (parseToDate(b.date)?.getTime() || 0)
    );

    return sortedWeights
      .map((current, index) => {
        if (index === 0) return null;
        const previous = sortedWeights[index - 1];

        const diffTime = Math.abs(
          new Date(current.date).getTime() - new Date(previous.date).getTime()
        );
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days === 0) return null;

        const totalGain = current.value - previous.value;
        const dailyGain = totalGain / days;

        return {
          dailyGain,
          days,
          endDate: current.date,
          initialDate: previous.date,
          totalGain,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [weights]);

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (!matriz) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 font-medium">Matriz não encontrada</p>
      </div>
    );
  }

  return (
    <main>
      <div className="flex-1 overflow-y-auto w-full">
        <div className="space-y-3 w-full">
          <div>
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-2 h-auto gap-1 shadow-sm">
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
                  <span className="uppercase">Pesagem</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reproduction"
                  className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                >
                  <span className="uppercase text-[11px]">Reprodução</span>
                </TabsTrigger>
              </TabsList>

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
                          {formatDate(matriz?.born_date)}
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
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Sexo
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {matriz?.sex}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border py-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Genotipagem
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {matriz?.genotyping}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Condição gestacional
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {matriz?.condition || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 grid grid-cols-1 gap-x-4">
                    <div className="bg-card border border-border rounded-lg px-3 py-2">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Índices Genéticos
                      </h3>
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase block">
                            F%
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {matriz?.f}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase block">
                            P%
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {matriz?.p}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[11px] text-gray-500 uppercase">
                            IABCZG
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {matriz?.iabcgz}
                          </span>
                        </div>
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-[10px] text-gray-500 uppercase">
                            Deca
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {matriz?.deca}
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
                          Pai
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {matriz?.father_name}
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
                          {matriz?.maternal_grandfather_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-[11px] text-gray-500 uppercase">
                          Avô Paterno
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {matriz?.paternal_grandfather_name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 grid grid-cols-1 gap-x-4 w-full">
                      <div className="bg-card border border-border rounded-lg px-3 py-2 w-full">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Classificação
                        </h3>
                        <div className="grid grid-cols-4 justify-between items-center w-full">
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase block">
                              Classe
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {matriz?.classification}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[11px] text-gray-500 uppercase">
                              Status
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {matriz?.status}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[10px] text-gray-500 uppercase">
                              Tipo
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {matriz?.type || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-[10px] text-gray-500 uppercase">
                              Sociedade
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {matriz?.partnership || "-"}
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
                      vaccines.map((v) => [v.id, v.vaccine_name])
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
                              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
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
                                className="flex-shrink-0 p-2 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                value="pesagem-list"
                className="mt-0 animate-in fade-in-0 duration-200"
              >
                <div className="border-t border-border pt-3"></div>
                <Tabs defaultValue="weight-list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 -mb-3 h-auto gap-1 shadow-sm">
                    <TabsTrigger
                      value="weight-list"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Pesagens</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="weight-graphic"
                      className="flex flex-col text-gray-500 items-center gap-1 py-2.5 px-1 text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <span className="uppercase">Gráfico</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="weight-list"
                    className="mt-4 animate-in fade-in-0 duration-200"
                  >
                    <div className="space-y-3 w-full">
                      <DetailsWeightList
                        weightData={weightData}
                        gainDaily={gainDaily}
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
                    value="weight-graphic"
                    className="mt-4 space-y-6 animate-in fade-in-0 duration-200"
                  >
                    <ChartLineLabel
                      title="Pesos"
                      description="Evolução mensal"
                      data={weightData}
                      colorVar="--chart-1"
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
                      <div key={event.event_id} className="space-y-2">
                        <div className="px-2">
                          <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                            Novo Layout Sugerido
                          </span>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          <ReproductionIATFCard
                            event={event}
                            matriz={matriz}
                            onEdit={handleEditReproduction}
                            onDelete={handleDeleteReproduction}
                          />
                        </Accordion>

                        <div className="px-2 mt-4">
                          <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                            Opção 3: Lista Completa (Sem Tabs)
                          </span>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          <ReproductionEventListCard
                            event={event}
                            matriz={matriz}
                            onEdit={handleEditReproduction}
                            onDelete={handleDeleteReproduction}
                          />
                        </Accordion>

                        <div className="px-2 mt-4">
                          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted/5 px-2 py-0.5 rounded-full border border-muted-foreground/10">
                            Layout Original Atual
                          </span>
                        </div>
                        <Accordion type="single" collapsible className="w-full">
                          <ReproductionEventCard
                            event={event}
                            onEdit={handleEditReproduction}
                            onDelete={handleDeleteReproduction}
                          />
                        </Accordion>
                        <div className="h-px bg-border my-8" />
                      </div>
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

export default DetailsMatrizLayout;
