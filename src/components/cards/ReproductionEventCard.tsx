"use client";

import { Edit2, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/formatDates";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ReproductionEventCardProps {
  event: ReproductionEvent;
  onEdit?: (event: ReproductionEvent) => void;
  onDelete?: (eventId: string) => void;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PhaseTabs = ({ event }: { event: ReproductionEvent }) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="inicial" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-2 h-auto gap-1 shadow-sm">
          <TabsTrigger
            value="inicial"
            className="flex flex-col text-gray-500 items-center gap-1 py-1.5 px-1 text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 uppercase"
          >
            Inicial
          </TabsTrigger>
          <TabsTrigger
            value="resync"
            className="flex flex-col text-gray-500 items-center gap-1 py-1.5 px-1 text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 uppercase"
          >
            Resync
          </TabsTrigger>
          <TabsTrigger
            value="monta"
            className="flex flex-col text-gray-500 items-center gap-1 py-1.5 px-1 text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 uppercase"
          >
            Monta
          </TabsTrigger>
        </TabsList>

        <div className="bg-card border border-border rounded-lg px-3 py-2 w-full min-h-[100px] space-y-1">
          <TabsContent value="inicial" className="mt-0 space-y-1">
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D8</span>
              <span className="text-sm font-semibold text-primary">
                {event.d8_date ? formatDate(event.d8_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D10</span>
              <span className="text-sm font-semibold text-primary">
                {event.d10_date ? formatDate(event.d10_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">Touro</span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.bull_name || "-"}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="resync" className="mt-0 space-y-1">
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D22</span>
              <span className="text-sm font-semibold text-primary">
                {event.d22_date ? formatDate(event.d22_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D30</span>
              <span className="text-sm font-semibold text-primary">
                {event.d30_date ? formatDate(event.d30_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D32</span>
              <span className="text-sm font-semibold text-primary">
                {event.d32_date ? formatDate(event.d32_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">Touro</span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.resync_bull || "-"}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="monta" className="mt-0 space-y-1">
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D35</span>
              <span className="text-sm font-semibold text-primary">
                {event.natural_mating_d35_entry
                  ? formatDate(event.natural_mating_d35_entry)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">D80</span>
              <span className="text-sm font-semibold text-primary">
                {event.natural_mating_d80_exit
                  ? formatDate(event.natural_mating_d80_exit)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">Touro</span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.natural_mating_bull || "-"}
              </span>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export const ReproductionEventCard = ({
  event,
  onEdit,
  onDelete,
}: ReproductionEventCardProps) => {
  const diagnosticResult = event.final_diagnostic || event.diagnostic_d30;
  const isPrenha = diagnosticResult === "prenha";
  const isVazia = diagnosticResult === "vazia";
  const hasResult = isPrenha || isVazia;

  return (
    <AccordionItem
      value={event.event_id}
      className="border-b-2 border-primary/20 bg-card overflow-hidden w-full "
    >
      <AccordionTrigger className="flex flex-row items-center justify-between px-4 py-2 hover:no-underline transition-colors w-full border-t-2 border-x-2 border-primary/20">
        <div className="flex flex-row items-center gap-10">
          <div className="flex flex-col items-start gap-1">
            <span className="text-primary font-black text-sm uppercase">
              {event.event_type}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {event.d0_date && formatDate(event.d0_date)}
            </span>
          </div>

          {hasResult && (
            <span
              className={`text-sm font-black uppercase mr-2 px-2 py-1 rounded-sm ${
                isPrenha
                  ? "text-green-600 border-green-600 border bg-green-600/20"
                  : "text-red-600 border-red-600 border bg-red-600/20"
              }`}
            >
              {isPrenha ? "PRENHA" : "VAZIA"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(event);
            }}
            className="p-2 text-gray-500 hover:text-primary transition-colors rounded-sm border border-muted-foreground/20"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(event.event_id);
            }}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors border border-muted-foreground/20 rounded-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-2 py-4 border border-muted-foreground/20 rounded-b-2xl w-full">
        <div className="space-y-4 w-full">
          <div className="bg-card border border-border rounded-lg px-3 py-2 w-full space-y-1">
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                Origem Gestação
              </span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.pregnancy_origin || "Não informado"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                DATA INICIAL (D0)
              </span>
              <span className="text-sm font-semibold text-primary">
                {event.d0_date ? formatDate(event.d0_date) : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                Diagnostico D30
              </span>
              <span
                className={`text-sm font-semibold uppercase ${
                  event.diagnostic_d30 === "prenha"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {event.diagnostic_d30 || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                Diagnostico D110
              </span>
              <span
                className={`text-sm font-semibold uppercase ${
                  event.final_diagnostic === "prenha"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {event.final_diagnostic || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                Avaliação Ovulos
              </span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.ovary_size || "-"}/{event.ovary_structure || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">Ciclo</span>
              <span className="text-sm font-semibold text-primary uppercase">
                {event.cycle_stage || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">ECC</span>
              <span className="text-sm font-semibold text-primary">
                {event.body_score || "-"}
              </span>
            </div>
          </div>

          {/* Phase Tabs */}
          <PhaseTabs event={event} />
          {/* Previsão Parto Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-full space-y-1">
            <h4 className="text-[11px] font-bold text-black uppercase mb-2 border-b border-black/10 pb-1 w-fit">
              Previsão Parto
            </h4>
            <div className="flex justify-between items-center border-b border-primary/10 py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                DATA INICIAL
              </span>
              <span className="text-sm font-semibold text-primary">
                {event.calving_start_date
                  ? formatDate(event.calving_start_date)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] text-gray-500 uppercase">
                DATA FINAL
              </span>
              <span className="text-sm font-semibold text-primary">
                {event.calving_end_date
                  ? formatDate(event.calving_end_date)
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
