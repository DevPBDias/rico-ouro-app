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
import { Checkbox } from "@/components/ui/checkbox";
import { Farm } from "@/types/farm.type";

interface FarmFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  currentFarmIds?: string[];
  currentFilterMode?: "all" | "specific" | "multiple";
  onConfirm: (
    farmIds: string[],
    farmNames: string[],
    filterMode: "all" | "specific" | "multiple",
  ) => void;
}

export function FarmFilterModal({
  open,
  onOpenChange,
  farms,
  currentFarmIds = [],
  currentFilterMode = "all",
  onConfirm,
}: FarmFilterModalProps) {
  const [filterMode, setFilterMode] = React.useState<
    "all" | "specific" | "multiple"
  >(currentFilterMode);
  const [selectedFarmIds, setSelectedFarmIds] =
    React.useState<string[]>(currentFarmIds);

  React.useEffect(() => {
    if (open) {
      setFilterMode(currentFilterMode);
      setSelectedFarmIds(currentFarmIds);
    }
  }, [open, currentFarmIds, currentFilterMode]);

  const toggleFarm = (farmId: string) => {
    setSelectedFarmIds((prev) =>
      prev.includes(farmId)
        ? prev.filter((id) => id !== farmId)
        : [...prev, farmId],
    );
  };

  const handleConfirm = () => {
    if (filterMode === "all") {
      onConfirm([], [], "all");
    } else {
      if (selectedFarmIds.length === 0) return;
      const names = selectedFarmIds
        .map((id) => farms.find((f) => f.id === id)?.farm_name || "")
        .filter(Boolean);
      onConfirm(
        selectedFarmIds,
        names,
        selectedFarmIds.length === 1 ? "specific" : "multiple",
      );
    }
    onOpenChange(false);
  };

  const isSpecific = filterMode !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Fazenda</DialogTitle>
          <DialogDescription>
            Escolha se deseja mostrar animais de todas as fazendas ou selecione
            as fazendas desejadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div
              className="flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-muted/50"
              style={{
                borderColor: !isSpecific
                  ? "hsl(var(--primary))"
                  : "hsl(var(--border))",
                backgroundColor: !isSpecific
                  ? "hsl(var(--primary) / 0.05)"
                  : "transparent",
              }}
              onClick={() => {
                setFilterMode("all");
                setSelectedFarmIds([]);
              }}
            >
              <Checkbox
                checked={!isSpecific}
                onCheckedChange={() => {
                  setFilterMode("all");
                  setSelectedFarmIds([]);
                }}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Todas as Fazendas
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-muted/50"
              style={{
                borderColor: isSpecific
                  ? "hsl(var(--primary))"
                  : "hsl(var(--border))",
                backgroundColor: isSpecific
                  ? "hsl(var(--primary) / 0.05)"
                  : "transparent",
              }}
              onClick={() => setFilterMode("multiple")}
            >
              <Checkbox
                checked={isSpecific}
                onCheckedChange={() => setFilterMode("multiple")}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Selecionar Fazendas
              </Label>
            </div>
          </div>

          {isSpecific && (
            <div className="space-y-2 pl-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Selecione as fazendas desejadas
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {farms.map((farm) => (
                  <div
                    key={farm.id}
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/30 ${
                      selectedFarmIds.includes(farm.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => toggleFarm(farm.id)}
                  >
                    <Checkbox
                      checked={selectedFarmIds.includes(farm.id)}
                      onCheckedChange={() => toggleFarm(farm.id)}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm cursor-pointer flex-1">
                      {farm.farm_name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedFarmIds.length > 0 && (
                <p className="text-[10px] text-primary font-semibold mt-1">
                  {selectedFarmIds.length}{" "}
                  {selectedFarmIds.length === 1
                    ? "fazenda selecionada"
                    : "fazendas selecionadas"}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSpecific && selectedFarmIds.length === 0}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
