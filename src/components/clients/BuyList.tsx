"use client";

import { BUY_MOCK } from "@/constants/buy_mock";
import { Accordion } from "@/components/ui/accordion";
import { BuyListItem } from "./BuyListItem";
import { ShoppingBag } from "lucide-react";

export function BuyList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase text-foreground/60 flex items-center gap-2">
          <ShoppingBag size={14} />
          Lista de Compras
        </h3>
        <span className="text-[11px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-sm uppercase">
          Montante: R$ 3.800,50
        </span>
      </div>

      {BUY_MOCK.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          defaultValue={BUY_MOCK[0].rgn}
          className="w-full"
        >
          {BUY_MOCK.map((buy) => (
            <BuyListItem key={buy.rgn} buy={buy} />
          ))}
        </Accordion>
      ) : (
        <div className="bg-muted/10 rounded-2xl p-8 border border-dashed border-muted flex flex-col items-center justify-center text-center">
          <ShoppingBag
            size={24}
            className="text-muted-foreground mb-2 opacity-50"
          />
          <p className="text-[11px] font-bold text-muted-foreground uppercase">
            Nenhuma compra registrada
          </p>
        </div>
      )}
    </div>
  );
}
