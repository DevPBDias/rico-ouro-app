"use client";

import { useSales } from "@/hooks/db/sales/useSales";
import { useClients } from "@/hooks/db/clients/useClients";
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
import { Badge } from "@/components/ui/badge";

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

  const clientsMap = useMemo(() => {
    const map: Record<string, string> = {};
    clients.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [clients]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pago":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Pago
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pendente
          </Badge>
        );
      case "parcelado":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Parcelado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status || "—"}
          </Badge>
        );
    }
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
            <SelectTrigger className="h-10 rounded-xl bg-white">
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
            <SelectTrigger className="h-10 rounded-xl bg-white">
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
            <SelectTrigger className="h-10 rounded-xl bg-white">
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
            <SelectTrigger className="h-10 rounded-xl bg-white">
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
            className="pl-10 h-12 rounded-xl bg-white shadow-sm border-none focus-visible:ring-primary"
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
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : sales.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            defaultValue={sales[0]?.id}
            className="space-y-2"
          >
            {sales.map((sale) => (
              <AccordionItem
                key={sale.id}
                value={sale.id}
                className="bg-white rounded-2xl border-none shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex flex-col items-start text-left w-full">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-primary">
                        INDI {sale.animal_rgn}
                      </span>
                      {getStatusBadge(sale.financial_status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{clientsMap[sale.client_id] || "—"}</span>
                      <span>•</span>
                      <span>{formatDate(sale.date)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Tipo de pagamento
                      </p>
                      <p className="font-medium">
                        {sale.payment_method || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Entrada</p>
                      <p className="font-medium">
                        {formatCurrency(sale.down_payment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Valor Total
                      </p>
                      <p className="font-medium text-primary">
                        {formatCurrency(sale.total_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Parcelas</p>
                      <p className="font-medium">{sale.installments || "—"}</p>
                    </div>
                    {sale.gta_number && (
                      <div>
                        <p className="text-muted-foreground text-xs">GTA</p>
                        <p className="font-medium">{sale.gta_number}</p>
                      </div>
                    )}
                    {sale.invoice_number && (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Nota Fiscal
                        </p>
                        <p className="font-medium">{sale.invoice_number}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
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
