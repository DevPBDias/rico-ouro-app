"use client";

import { useSales } from "@/hooks/db/sales/useSales";
import { useClients } from "@/hooks/db/clients/useClients";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatDates";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const InfoRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex justify-between gap-2 items-center border-b border-border/50 py-0.5 last:border-0">
    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">
      {label}
    </span>
    <span
      className={cn(
        "text-[13px] font-semibold uppercase",
        highlight ? "text-primary" : "text-foreground",
      )}
    >
      {value || "-"}
    </span>
  </div>
);

const statusConfig: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  pago: {
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  pendente: {
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  parcelado: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
};

export function SalesList() {
  const {
    sales,
    isLoading,
    searchSales,
    setYearFilter,
    setMonthFilter,
    setClientFilter,
    setPaymentMethodFilter,
    availableYears,
  } = useSales();

  const { clients } = useClients();
  const { animals } = useAnimals();

  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [clients]);

  const animalsMap = useMemo(() => {
    const map: Record<
      string,
      { sex?: string; iabcgz?: string; deca?: string }
    > = {};
    animals.forEach((a) => {
      if (a.rgn) {
        map[a.rgn] = { sex: a.sex, iabcgz: a.iabcgz, deca: a.deca };
      }
    });
    return map;
  }, [animals]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
          <Filter size={14} />
          Filtros
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            onValueChange={(v) => setYearFilter(v === "all" ? null : Number(v))}
          >
            <SelectTrigger className="h-12 rounded-md bg-white w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) =>
              setMonthFilter(v === "all" ? null : Number(v))
            }
          >
            <SelectTrigger className="h-12 rounded-md bg-white  w-full">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={String(idx + 1)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) => setClientFilter(v === "all" ? null : v)}
          >
            <SelectTrigger className="h-12 rounded-md bg-white w-full">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) =>
              setPaymentMethodFilter(v === "all" ? null : v)
            }
          >
            <SelectTrigger className="h-12 rounded-md bg-white w-full">
              <SelectValue placeholder="Tipo Pgto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="À Vista">À Vista</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por RGN, GTA ou Nota..."
            className="pl-10 h-12 rounded-md bg-white shadow-sm border-none focus-visible:ring-primary placeholder:text-sm"
            onChange={(e) => searchSales(e.target.value)}
          />
        </div>
      </div>

      {/* Sales List */}
      <div>
        <h2 className="text-xs font-bold uppercase text-muted-foreground mb-4">
          Lista de vendas ({sales.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : sales.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            defaultValue={sales[0]?.id}
            className="space-y-3"
          >
            {sales.map((sale) => {
              const animalInfo = animalsMap[sale.animal_rgn];
              const status = sale.financial_status?.toLowerCase() || "";
              const config = statusConfig[status] || {
                color: "text-gray-500",
                bg: "bg-gray-500/10",
                border: "border-gray-500/20",
              };

              return (
                <AccordionItem
                  key={sale.id}
                  value={sale.id}
                  className="border-2 border-primary/20 bg-card/50 rounded-xl overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="flex flex-1 items-center justify-between px-4 py-3 hover:no-underline transition-all hover:bg-primary/5">
                    <div className="flex flex-col items-start justify-start gap-1">
                      <div className="flex flex-col items-start truncate">
                        <span className="font-bold text-base text-primary tracking-tight">
                          INDI {sale.animal_rgn}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium uppercase">
                          {formatDate(sale.date)}
                        </span>
                      </div>
                      {/* Animal Info */}
                      {animalInfo && (
                        <div className="flex flex-row items-start justify-start gap-3">
                          <p className="text-[9px] text-muted-foreground">
                            Sexo:{" "}
                            <span className="font-bold text-primary text-xs">
                              {animalInfo.sex || "-"}
                            </span>
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            iABCZg:{" "}
                            <span className="font-bold text-primary text-xs">
                              {animalInfo.iabcgz || "-"}
                            </span>
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            DECA:{" "}
                            <span className="font-bold text-primary text-xs">
                              {animalInfo.deca || "-"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase px-3 py-1 rounded-md border shadow-sm",
                          config.bg,
                          config.color,
                          config.border,
                        )}
                      >
                        {sale.financial_status || "—"}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex flex-col gap-0.5">
                        {/* Sale Info */}
                        <InfoRow
                          label="Cliente"
                          value={clientsMap[sale.client_id] || "—"}
                        />
                        <InfoRow
                          label="Valor Total"
                          value={formatCurrency(sale.total_value)}
                          highlight
                        />
                        <InfoRow
                          label="Pagamento"
                          value={sale.payment_method || "-"}
                        />
                        {sale.payment_method === "Boleto" && (
                          <>
                            <InfoRow
                              label="Entrada"
                              value={formatCurrency(sale.down_payment)}
                            />
                            <InfoRow
                              label="Parcelas"
                              value={sale.installments || "0"}
                            />
                            <InfoRow
                              label="Valor das Parcelas"
                              value={formatCurrency(sale.installment_value)}
                              highlight
                            />
                          </>
                        )}
                        <InfoRow label="GTA" value={sale.gta_number || "-"} />
                        <InfoRow
                          label="Nota Fiscal"
                          value={sale.invoice_number || "-"}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <div className="bg-card/50 border-2 border-dashed border-primary/20 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground mb-4">
              <Search size={32} />
            </div>
            <p className="text-muted-foreground font-medium">
              Nenhuma venda encontrada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
