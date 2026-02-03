"use client";

import { Buy } from "@/constants/buy_mock";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ListChecks,
  Hash,
} from "lucide-react";

interface BuyListItemProps {
  buy: Buy;
  isOpen?: boolean;
}

export function BuyListItem({ buy, isOpen }: BuyListItemProps) {
  const isPaid = buy.status.toLowerCase() === "pago";

  return (
    <AccordionItem
      value={buy.rgn}
      className="border border-border/50 mb-3 bg-muted/20 rounded-2xl overflow-hidden"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-all data-[state=open]:bg-white">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPaid ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
            >
              <Hash size={18} />
            </div>
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-sm font-bold text-primary">{buy.rgn}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">
                {buy.date}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-black text-primary">{buy.value}</span>
            <div
              className={`flex items-center gap-1 text-[12px] font-black uppercase ${isPaid ? "text-green-600" : "text-amber-600"}`}
            >
              {isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {buy.status}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5 pt-4 bg-white">
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
              <CreditCard size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                Pagamento
              </span>
              <span className="text-xs font-bold leading-tight">
                {buy.payment_type}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
              <ArrowUpRight size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                Entrada
              </span>
              <span className="text-xs font-bold leading-tight">
                {buy.entry}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
              <AlertCircle size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                A Pagar
              </span>
              <span className="text-xs font-bold leading-tight">
                {buy.installments_to_pay} parcelas
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground">
              <ListChecks size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                Pagas
              </span>
              <span className="text-xs font-bold leading-tight">
                {buy.installments_paid} parcelas
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
