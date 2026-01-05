"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { Animal } from "@/types/animal.type";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { formatDate } from "@/utils/formatDates";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreateReproductionModal } from "@/components/modals/reproduction/CreateReproductionModal";
import { EditReproductionModal } from "@/components/modals/reproduction/EditReproductionModal";
import { DeleteReproductionModal } from "@/components/modals/reproduction/DeleteReproductionModal";

interface ManageReproductionProps {
  selectedAnimal: Animal | null;
}

export const ManageReproduction = ({ selectedAnimal }: ManageReproductionProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ReproductionEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ReproductionEvent | null>(null);

  const { events: reproductionEvents, isLoading: eventsLoading } =
    useReproductionEvents(selectedAnimal?.rgn);

  if (!selectedAnimal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <p className="text-muted-foreground font-medium">Selecione um animal acima para gerenciar sua reprodução.</p>
      </div>
    );
  }

  const handleEditEvent = (event: ReproductionEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteEvent = (event: ReproductionEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 space-y-6">
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full py-6 text-sm font-black uppercase shadow-lg shadow-primary/20 rounded-xl"
      >
        <Plus className="w-5 h-5 mr-2" />
        Novo Evento de Reprodução
      </Button>

      <div className="space-y-4">
        <h3 className="font-bold text-[10px] uppercase text-primary/60 tracking-widest px-1">
          Histórico de Reprodução
        </h3>

        {eventsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : reproductionEvents.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-3">
            {reproductionEvents.map((event) => {
              const isPrenha = event.gestation_diagnostic_type === "Prenha";
              const hasResult = !!event.gestation_diagnostic_type;

              return (
                <AccordionItem
                  key={event.id}
                  value={event.id}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-black text-sm uppercase">
                          {event.type}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-medium">
                          {event.date && formatDate(event.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasResult && (
                          <span
                            className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                              isPrenha
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {event.gestation_diagnostic_type}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <div
                            role="button"
                            onClick={(e) => handleEditEvent(event, e)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </div>
                          <div
                            role="button"
                            onClick={(e) => handleDeleteEvent(event, e)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-2">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Data</span>
                        <span className="font-semibold text-foreground">{formatDate(event.date)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Touro</span>
                        <span className="font-semibold text-foreground">{event.bull || "-"}</span>
                      </div>
                      {event.weight && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Peso</span>
                          <span className="font-semibold text-foreground">{event.weight} kg</span>
                        </div>
                      )}
                      {event.donor && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Doadora</span>
                          <span className="font-semibold text-foreground">{event.donor}</span>
                        </div>
                      )}
                    </div>

                    {(event.gestation_diagnostic_date || event.gestation_diagnostic_type) && (
                      <div className="mt-5 pt-4 border-t border-border">
                        <span className="text-[10px] font-black uppercase text-primary mb-3 block tracking-wider">Diagnóstico</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Resultado</span>
                            <span className={`font-black ${isPrenha ? "text-green-600" : "text-red-600"}`}>
                              {event.gestation_diagnostic_type || "-"}
                            </span>
                          </div>
                          {event.expected_sex && (
                            <div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Sexo</span>
                              <span className="font-semibold text-foreground">{event.expected_sex}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-muted italic">
            <p>Nenhum evento registrado no histórico.</p>
          </div>
        )}
      </div>

      <CreateReproductionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        rgn={selectedAnimal.rgn}
        onSuccess={() => {}}
      />

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
    </div>
  );
};
