"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, ArrowRight, Plus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { useMatrizes } from "@/hooks/matrizes/useMatrizes";
import { Animal } from "@/types/animal.type";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { CreateReproductionModal } from "@/components/modals/reproduction/CreateReproductionModal";
import { EditReproductionModal } from "@/components/modals/reproduction/EditReproductionModal";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { formatDate } from "@/utils/formatDates";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ReproducaoPage() {
  const router = useRouter();
  const { matrizes } = useMatrizes();

  // Estados de Busca
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMatriz, setSelectedMatriz] = useState<Animal | null>(null);

  // Estados de Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ReproductionEvent | null>(
    null
  );

  // Hook de Eventos (carrega quando matriz selecionada)
  const { events: reproductionEvents, isLoading: eventsLoading } =
    useReproductionEvents(selectedMatriz?.rgn);

  // Lógica de Busca
  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }
      setIsSearching(true);
      setHasSearched(false);
      setTimeout(() => {
        const results = matrizes.filter((matriz) => {
          const rgn = matriz.rgn?.toString().toLowerCase() || "";
          const name = matriz.name?.toLowerCase() || "";
          const queryLower = query.toLowerCase();
          return rgn.includes(queryLower) || name.includes(queryLower);
        });
        setSearchResults(results);
        setIsSearching(false);
        setHasSearched(true);
      }, 300);
    },
    [matrizes]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleSelectMatriz = (animal: Animal) => {
    setSelectedMatriz(animal);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedMatriz(null);
    setHasSearched(false);
  };

  const handleEditEvent = (event: ReproductionEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir o accordion
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-20">
      <Header title="Reprodução" />

      <main className="flex-1 px-6 py-6">
        {!selectedMatriz ? (
          /* --- TELA DE BUSCA --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="font-bold uppercase text-sm text-primary block mb-3">
                Buscar Matriz:
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  className="pl-4 py-5 text-lg bg-card border-border shadow-sm rounded-xl focus:ring-primary focus:border-primary placeholder:text-muted-foreground placeholder:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="RGN, nome..."
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Buscando...</p>
                </div>
              ) : hasSearched && searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                  <p>Nenhuma matriz encontrada.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {searchResults.map((animal) => (
                    <div
                      key={animal.rgn}
                      onClick={() => handleSelectMatriz(animal)}
                      className="bg-card border border-border p-4 rounded-xl shadow-sm active:scale-[0.98] transition-transform cursor-pointer flex justify-between items-center group hover:border-primary/50"
                    >
                      <div>
                        <p className="font-bold text-lg text-primary">
                          {animal.rgn}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {animal.name || "Sem nome"}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- TELA DE DETALHES E EVENTOS --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header Matriz */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                  Matriz Selecionada
                </span>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {selectedMatriz.rgn}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMatriz.name || "Sem nome"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 h-auto py-2 px-3 text-xs uppercase font-bold"
              >
                Trocar
              </Button>
            </div>

            {/* Ações */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-6 text-sm font-bold uppercase shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Evento
            </Button>

            {/* Lista de Eventos */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase text-muted-foreground px-1">
                Histórico de Reprodução
              </h3>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : reproductionEvents.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-3">
                  {reproductionEvents.map((event) => {
                    const isPrenha =
                      event.gestation_diagnostic_type === "Prenha";
                    const hasResult = !!event.gestation_diagnostic_type;

                    return (
                      <AccordionItem
                        key={event.id}
                        value={event.id}
                        className="bg-card border border-border rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between w-full pr-2">
                            <div className="flex items-center gap-3">
                              <span className="text-primary font-bold text-sm uppercase">
                                {event.type}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {event.date && formatDate(event.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasResult && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isPrenha
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {event.gestation_diagnostic_type}
                                </span>
                              )}
                              {/* Botão de Edição Inline */}
                              <div
                                role="button"
                                onClick={(e) => handleEditEvent(event, e)}
                                className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary z-10"
                              >
                                <Pencil className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-4 pt-2 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] uppercase text-muted-foreground block">
                                  Data
                                </span>
                                <span className="font-medium">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase text-muted-foreground block">
                                  Peso
                                </span>
                                <span className="font-medium">
                                  {event.weight ? `${event.weight} kg` : "-"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase text-muted-foreground block">
                                  Touro
                                </span>
                                <span className="font-medium">
                                  {event.bull || "-"}
                                </span>
                              </div>
                              {event.donor && (
                                <div>
                                  <span className="text-[10px] uppercase text-muted-foreground block">
                                    Doadora
                                  </span>
                                  <span className="font-medium">
                                    {event.donor}
                                  </span>
                                </div>
                              )}
                            </div>

                            {(event.gestation_diagnostic_date ||
                              event.gestation_diagnostic_type) && (
                              <div className="border-t border-border pt-3">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-2">
                                  Diagnóstico
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-[10px] uppercase text-muted-foreground block">
                                      Data
                                    </span>
                                    <span className="font-medium">
                                      {formatDate(
                                        event.gestation_diagnostic_date
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase text-muted-foreground block">
                                      Resultado
                                    </span>
                                    <span
                                      className={`font-bold ${
                                        isPrenha
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {event.gestation_diagnostic_type || "-"}
                                    </span>
                                  </div>
                                  {isPrenha && (
                                    <div>
                                      <span className="text-[10px] uppercase text-muted-foreground block">
                                        Sexo
                                      </span>
                                      <span className="font-medium">
                                        {event.expected_sex || "-"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                  <p>Nenhum evento registrado.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAIS */}
      {selectedMatriz && (
        <CreateReproductionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          rgn={selectedMatriz.rgn}
          onSuccess={() => {
            /* Não precisa fazer nada, o hook de lista atualiza automatico via RxDB */
          }}
        />
      )}

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
    </div>
  );
}
