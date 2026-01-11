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

const InfoRow = ({
  label,
  value,
  subLabel,
  highlight,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-center border-b border-border/50 py-1 last:border-0">
    <div className="flex flex-row gap-1 items-center">
      <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">
        {label}
      </span>
      {subLabel && (
        <span className="text-[10px] text-muted-foreground/90 italic leading-none">
          {subLabel}
        </span>
      )}
    </div>
    <span
      className={`text-[13px] font-semibold ${
        highlight ? "text-primary" : "text-foreground"
      } uppercase`}
    >
      {value || "-"}
    </span>
  </div>
);

const PhaseTabs = ({ event }: { event: ReproductionEvent }) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="iatf" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-1 mb-2 h-auto gap-1 shadow-sm">
          <TabsTrigger
            value="iatf"
            className="flex flex-col text-gray-500 items-center gap-1 py-1.5 px-1 text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200 uppercase"
          >
            IATF
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
          <TabsContent value="iatf" className="mt-0 space-y-1">
            <InfoRow
              label="Data D0"
              value={event.d0_date ? formatDate(event.d0_date) : "-"}
            />
            <InfoRow
              label="Data D8"
              value={event.d8_date ? formatDate(event.d8_date) : "-"}
            />
            <InfoRow
              label="Data D10 (IA)"
              value={event.d10_date ? formatDate(event.d10_date) : "-"}
            />
            <InfoRow
              label="Touro / Sêmen"
              value={event.bull_name || "-"}
              highlight
            />
          </TabsContent>

          <TabsContent value="resync" className="mt-0 space-y-1">
            <InfoRow
              label="Data D23"
              value={event.d22_date ? formatDate(event.d22_date) : "-"}
            />
            <InfoRow
              label="Data D30"
              value={event.d30_date ? formatDate(event.d30_date) : "-"}
            />
            <InfoRow
              label="Data D32"
              value={event.d32_date ? formatDate(event.d32_date) : "-"}
            />
            <InfoRow
              label="Touro / Sêmen"
              value={event.resync_bull || "-"}
              highlight
            />
          </TabsContent>

          <TabsContent value="monta" className="mt-0 space-y-1">
            <InfoRow
              label="Data Entrada D35"
              value={
                event.natural_mating_d35_entry
                  ? formatDate(event.natural_mating_d35_entry)
                  : "-"
              }
            />
            <InfoRow
              label="Data Saída D80"
              value={
                event.natural_mating_d80_exit
                  ? formatDate(event.natural_mating_d80_exit)
                  : "-"
              }
            />
            <InfoRow
              label="Touro / Sêmen"
              value={event.natural_mating_bull || "-"}
              highlight
            />
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
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(event);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onEdit?.(event);
              }
            }}
            className="p-2 text-gray-500 hover:text-primary transition-colors rounded-sm border border-muted-foreground/20 cursor-pointer"
          >
            <Edit2 size={18} />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(event.event_id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onDelete?.(event.event_id);
              }
            }}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors border border-muted-foreground/20 rounded-sm cursor-pointer"
          >
            <Trash2 size={18} />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-2 py-4 border border-muted-foreground/20 rounded-b-2xl w-full">
        <div className="space-y-4 w-full">
          <div className="bg-card border border-border rounded-lg px-3 py-2 w-full space-y-1">
            <InfoRow
              label="Origem Gestação"
              value={event.pregnancy_origin || "Não informado"}
            />
            <InfoRow
              label="DATA INICIAL (D0)"
              value={event.d0_date ? formatDate(event.d0_date) : "-"}
            />
            <InfoRow
              label="Diagnostico D30"
              value={event.diagnostic_d30 || "-"}
              highlight={event.diagnostic_d30 === "prenha"}
            />
            <InfoRow
              label="Diagnostico D110"
              value={event.final_diagnostic || "-"}
              highlight={event.final_diagnostic === "prenha"}
            />
            <InfoRow
              label="Avaliação Ovulos"
              value={`${event.ovary_size || "-"}/${
                event.ovary_structure || "-"
              }`}
            />
            <InfoRow label="Ciclo" value={event.cycle_stage || "-"} />
            <InfoRow label="ECC" value={event.body_score || "-"} />
          </div>

          {/* Phase Tabs */}
          <PhaseTabs event={event} />
          {/* Previsão Parto Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 w-full space-y-1">
            <h4 className="text-[11px] font-bold text-black uppercase mb-2 border-b border-black/10 pb-1 w-fit">
              Previsão Parto
            </h4>
            <InfoRow
              label="DATA INICIAL"
              value={
                event.calving_start_date
                  ? formatDate(event.calving_start_date)
                  : "-"
              }
              highlight
            />
            <InfoRow
              label="DATA FINAL"
              value={
                event.calving_end_date
                  ? formatDate(event.calving_end_date)
                  : "-"
              }
              highlight
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
