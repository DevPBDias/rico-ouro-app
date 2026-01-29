"use client";

import { useState, useMemo } from "react";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useAnimalVaccines } from "@/hooks/db/animal_vaccines/useAnimalVaccines";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useDeleteAnimalVaccine } from "@/hooks/db/animal_vaccines/useDeleteAnimalVaccine";
import {
  Trash2,
  Syringe,
  Calendar,
  AlertCircle,
  ClipboardList,
  Scale,
  Heart,
} from "lucide-react";
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
import { Accordion } from "@/components/ui/accordion";
import { DetailsSkeleton } from "@/components/skeletons/DetailsSkeleton";
import { EditReproductionModal } from "@/components/modals/reproduction/EditReproductionModal";
import { DeleteReproductionModal } from "@/components/modals/reproduction/DeleteReproductionModal";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { ReproductionEventCard } from "../cards/ReproductionEventCard";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
        (parseToDate(b.date)?.getTime() || 0),
    );

    return sortedWeights
      .map((current, index) => {
        if (index === 0) return null;
        const previous = sortedWeights[index - 1];

        const diffTime = Math.abs(
          new Date(current.date).getTime() - new Date(previous.date).getTime(),
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="h-auto gap-2 rounded-xl p-1 bg-gradient-to-r from-muted/50 to-muted/30 shadow-sm mb-4 flex w-full">
                {[
                  { value: "dados", label: "Dados", icon: ClipboardList },
                  { value: "vaccines", label: "Vacinas", icon: Syringe },
                  { value: "pesagem-list", label: "Pesagem", icon: Scale },
                  { value: "reproduction", label: "Repro", icon: Heart },
                ].map(({ value, label, icon: Icon }) => {
                  const isActive = activeTab === value;

                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      asChild
                      className="p-0 border-none bg-transparent data-[state=active]:bg-transparent shadow-none"
                    >
                      <motion.div
                        layout
                        className={cn(
                          "flex h-9 items-center justify-center overflow-hidden rounded-md cursor-pointer transition-all duration-200",
                          isActive
                            ? "flex-1 !bg-[#1162ae] !text-primary-foreground shadow-none border-none"
                            : "flex-none text-muted-foreground hover:bg-muted/50",
                        )}
                        animate={{
                          width: isActive ? 110 : 40,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 60,
                          damping: 15,
                        }}
                      >
                        <motion.div className="flex h-9 w-full items-center justify-center px-2 gap-2">
                          <Icon className="aspect-square size-5 shrink-0" />
                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.span
                                className="font-semibold text-[11px] uppercase whitespace-nowrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                  duration: 0.6,
                                  ease: "easeInOut",
                                  delay: 0.1,
                                }}
                              >
                                {label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    </TabsTrigger>
                  );
                })}
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
                          Diagnóstico gestacional
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
                            <div className="flex flex-col">
                              {matriz?.status?.split(" / ").map((s, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "font-semibold text-primary truncate max-w-[80px]",
                                    matriz.status.includes("/")
                                      ? "text-[10px] leading-tight"
                                      : "text-sm",
                                  )}
                                >
                                  {s}
                                </span>
                              )) || "-"}
                            </div>
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
                      <Accordion
                        key={event.event_id}
                        type="single"
                        collapsible
                        className="w-full"
                      >
                        <ReproductionEventCard
                          event={event}
                          matriz={matriz}
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
