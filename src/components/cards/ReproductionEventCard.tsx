"use client";

import {
  Edit2,
  Trash2,
  Calendar,
  Info,
  Activity,
  ClipboardList,
} from "lucide-react";
import { formatDate } from "@/utils/formatDates";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { Animal } from "@/types/animal.type";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateAgeInMonths } from "@/hooks/utils/useAnimalsByAgeAndSex";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReproductionEventCardProps {
  event: ReproductionEvent;
  matriz: Animal;
  onEdit?: (event: ReproductionEvent) => void;
  onDelete?: (eventId: string) => void;
}

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

export const ReproductionEventCard = ({
  event,
  matriz,
  onEdit,
  onDelete,
}: ReproductionEventCardProps) => {
  const diagnosticResult = event.final_diagnostic || event.diagnostic_d30;
  const isPrenha = diagnosticResult === "prenha";
  const isVazia = diagnosticResult === "vazia";
  const hasResult = isPrenha || isVazia;

  const months = calculateAgeInMonths(matriz?.born_date);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const ageString = matriz?.born_date
    ? `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${
        remainingMonths === 1 ? "mês" : "meses"
      }`
    : "Não informada";

  return (
    <AccordionItem
      value={`iatf-${event.event_id}`}
      className="border-2 border-primary/30 bg-card/50 rounded-xl overflow-hidden mb-4 shadow-sm"
    >
      <AccordionTrigger className="flex flex-row items-center justify-between px-4 py-3 hover:no-underline transition-all hover:bg-primary/5 w-full">
        <div className="flex flex-row items-center gap-6">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-primary font-black text-sm uppercase tracking-tighter">
                {event.event_type}
              </span>
              <div className="h-4 w-[1px] bg-primary/20" />
              <span className="text-muted-foreground text-xs font-bold">
                {event.d0_date && formatDate(event.d0_date)}
              </span>
            </div>
          </div>

          {hasResult && (
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                isPrenha
                  ? "text-emerald-700 border-emerald-200 bg-emerald-100"
                  : "text-rose-700 border-rose-200 bg-rose-100"
              }`}
            >
              {isPrenha ? "PRENHA" : "VAZIA"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mr-2">
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
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-md border border-border bg-background cursor-pointer"
          >
            <Edit2 size={16} />
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
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-border rounded-md bg-background cursor-pointer"
          >
            <Trash2 size={16} />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-3 pb-4 space-y-4">
        {/* Informações Gerais */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Info size={14} className="stroke-[3]" />
            <h4 className="text-[11px] font-black uppercase tracking-wider">
              Informações Gerais da Matriz
            </h4>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <InfoRow label="Idade" value={ageString} />
            <InfoRow label="Genotipagem" value={matriz?.genotyping || "Não"} />
            <InfoRow
              label="Status Reprodutivo"
              value={event.productive_status || "Solteira"}
            />
          </div>
        </div>

        {/* Avaliação Reprodutiva */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Activity size={14} className="stroke-[3]" />
            <h4 className="text-[11px] font-black uppercase tracking-wider">
              Avaliação Reprodutiva da Matriz
            </h4>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <InfoRow
              label="Protocolo"
              value={event.protocol_name || "Padrão D10"}
            />
            <InfoRow
              label="Escore Corporal"
              value={event.body_score || "-"}
              subLabel="(1 a 5)"
            />

            <InfoRow
              label="Ovários (tamanho)"
              value={event.ovary_size || "Normais"}
            />
            <InfoRow
              label="Ovários (estruturas)"
              value={event.ovary_structure || "-"}
            />
            <InfoRow
              label="Estágio Ciclo Estral"
              value={event.cycle_stage || "-"}
            />
            <InfoRow
              label="DIAGNOSTICO GESTACIONAL (D30)"
              value={event.diagnostic_d30 || "Seca"}
            />
            <InfoRow
              label="Diagnóstico Final (D110)"
              value={event.final_diagnostic || "-"}
              highlight
            />
          </div>
        </div>

        {/* Phases Tabs */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <ClipboardList size={14} className="stroke-[3]" />
            <h4 className="text-[11px] font-black uppercase tracking-wider">
              Etapas da Reprodução
            </h4>
          </div>

          <Tabs defaultValue="iatf" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-9 mb-2">
              <TabsTrigger
                value="iatf"
                className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                SYNC D10
              </TabsTrigger>
              <TabsTrigger
                value="resync"
                className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Resync
              </TabsTrigger>
              <TabsTrigger
                value="monta"
                className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Monta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="iatf" className="mt-0">
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <InfoRow
                  label="Data D0"
                  value={event.d0_date ? formatDate(event.d0_date) : "-"}
                />
                <InfoRow
                  label="Data D8"
                  value={event.d8_date ? formatDate(event.d8_date) : "-"}
                />
                <InfoRow
                  label="Data D10"
                  value={event.d10_date ? formatDate(event.d10_date) : "-"}
                />
                <InfoRow
                  label="Touro / Sêmen"
                  value={event.bull_name || "-"}
                  highlight
                />
              </div>
            </TabsContent>

            <TabsContent value="resync" className="mt-0">
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <InfoRow
                  label="Data D0 (D22)"
                  value={event.d22_date ? formatDate(event.d22_date) : "-"}
                />
                <InfoRow
                  label="Data D8 (D30)"
                  value={event.d30_date ? formatDate(event.d30_date) : "-"}
                />
                <InfoRow
                  label="Data D10 (D32)"
                  value={event.d32_date ? formatDate(event.d32_date) : "-"}
                />
                <InfoRow
                  label="Touro / Sêmen"
                  value={event.resync_bull || "-"}
                  highlight
                />
              </div>
            </TabsContent>

            <TabsContent value="monta" className="mt-0">
              <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                <InfoRow
                  label="Data Entrada (D35)"
                  value={
                    event.natural_mating_d35_entry
                      ? formatDate(event.natural_mating_d35_entry)
                      : "-"
                  }
                />
                <InfoRow
                  label="Data Saída (D80)"
                  value={
                    event.natural_mating_d80_exit
                      ? formatDate(event.natural_mating_d80_exit)
                      : "-"
                  }
                />
                <InfoRow
                  label="Touro"
                  value={event.natural_mating_bull || "-"}
                  highlight
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-primary">
              <ClipboardList size={14} className="stroke-[3]" />
              <h4 className="text-[11px] font-black uppercase tracking-wider">
                Previsão Parto
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50/50 p-2 rounded border border-blue-100">
                <span className="text-[10px] uppercase text-muted-foreground block">
                  Início (270d)
                </span>
                <span className="text-sm font-bold text-primary">
                  {event.calving_start_date
                    ? formatDate(event.calving_start_date)
                    : "-"}
                </span>
              </div>
              <div className="bg-blue-50/50 p-2 rounded border border-blue-100">
                <span className="text-[10px] uppercase text-muted-foreground block">
                  Final (305d)
                </span>
                <span className="text-sm font-bold text-primary">
                  {event.calving_end_date
                    ? formatDate(event.calving_end_date)
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
