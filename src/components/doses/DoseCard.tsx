"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SemenDose } from "@/types/semen_dose.type";

interface DoseCardProps {
  dose: SemenDose;
  onIncrement: () => void;
  onDecrement: () => void;
  onIncrementBy5: () => void;
  onDecrementBy5: () => void;
  onDelete: () => void;
}

export function DoseCard({
  dose,
  onIncrement,
  onDecrement,
  onIncrementBy5,
  onDecrementBy5,
  onDelete,
}: DoseCardProps) {
  const isLowStock = dose.quantity > 0 && dose.quantity <= 3;
  const isZero = dose.quantity === 0;

  return (
    <div
      className={`
        flex items-center justify-between py-2 px-4 rounded-xl
        border transition-all duration-200 shadow-sm
        ${isZero ? "bg-red-50 border-red-200" : ""}
        ${isLowStock ? "bg-amber-50 border-amber-200" : ""}
        ${!isZero && !isLowStock ? "bg-white border-gray-100" : ""}
      `}
    >
      <span className="font-bold text-primary text-xs truncate max-w-[100px]">
        {dose.animalName}
      </span>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg p-1 border border-gray-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-white bg-muted text-xs font-bold"
            onClick={onDecrementBy5}
            disabled={dose.quantity < 5}
          >
            -5
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-white bg-muted"
            onClick={onDecrement}
            disabled={dose.quantity <= 0}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span
            className={`
              w-8 h-8 flex items-center justify-center font-bold tabular-nums
              ${isZero ? "text-red-500" : "text-primary"}
            `}
          >
            {dose.quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-white bg-muted"
            onClick={onIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-white bg-muted text-xs font-bold"
            onClick={onIncrementBy5}
          >
            +5
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-md border border-gray-200"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
