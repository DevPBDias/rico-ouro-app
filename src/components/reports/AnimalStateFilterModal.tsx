"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimalStateFilterValue } from "@/lib/pdf/definitions/types";

interface AnimalStateFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValue?: AnimalStateFilterValue;
  currentFilterMode?: "all" | "specific";
  onConfirm: (
    value: AnimalStateFilterValue | undefined,
    filterMode: "all" | "specific"
  ) => void;
}

export function AnimalStateFilterModal({
  open,
  onOpenChange,
  currentValue,
  currentFilterMode = "all",
  onConfirm,
}: AnimalStateFilterModalProps) {
  const [filterMode, setFilterMode] = React.useState<"all" | "specific">(
    currentFilterMode
  );
  const [selectedState, setSelectedState] = React.useState<
    AnimalStateFilterValue | undefined
  >(currentValue);

  React.useEffect(() => {
    if (open) {
      setFilterMode(currentFilterMode);
      setSelectedState(currentValue);
    }
  }, [open, currentValue, currentFilterMode]);

  const handleConfirm = () => {
    if (filterMode === "specific" && !selectedState) {
      return;
    }
    onConfirm(filterMode === "all" ? "Ambos" : selectedState, filterMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Atividade</DialogTitle>
          <DialogDescription>
            Escolha se deseja mostrar animais ativos, inativos ou ambos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div
              className="flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-muted/50"
              style={{
                borderColor:
                  filterMode === "all"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                backgroundColor:
                  filterMode === "all"
                    ? "hsl(var(--primary) / 0.05)"
                    : "transparent",
              }}
              onClick={() => {
                setFilterMode("all");
                setSelectedState("Ambos");
              }}
            >
              <Checkbox
                checked={filterMode === "all"}
                onCheckedChange={() => {
                  setFilterMode("all");
                  setSelectedState("Ambos");
                }}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Ambos (Ativos e Inativos)
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-muted/50"
              style={{
                borderColor:
                  filterMode === "specific"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                backgroundColor:
                  filterMode === "specific"
                    ? "hsl(var(--primary) / 0.05)"
                    : "transparent",
              }}
              onClick={() => setFilterMode("specific")}
            >
              <Checkbox
                checked={filterMode === "specific"}
                onCheckedChange={() => setFilterMode("specific")}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Atividade Específica
              </Label>
            </div>
          </div>

          {filterMode === "specific" && (
            <Select
              value={selectedState || ""}
              onValueChange={(value) =>
                setSelectedState(value as AnimalStateFilterValue)
              }
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={filterMode === "specific" && !selectedState}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
