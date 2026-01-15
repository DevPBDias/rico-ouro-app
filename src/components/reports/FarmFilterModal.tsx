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
import { Farm } from "@/types/farm.type";

interface FarmFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farms: Farm[];
  currentFarmId?: string;
  currentFilterMode?: "all" | "specific";
  onConfirm: (farmId: string | undefined, filterMode: "all" | "specific") => void;
}

export function FarmFilterModal({
  open,
  onOpenChange,
  farms,
  currentFarmId,
  currentFilterMode = "all",
  onConfirm,
}: FarmFilterModalProps) {
  const [filterMode, setFilterMode] = React.useState<"all" | "specific">(
    currentFilterMode
  );
  const [selectedFarmId, setSelectedFarmId] = React.useState<string | undefined>(
    currentFarmId
  );

  React.useEffect(() => {
    if (open) {
      setFilterMode(currentFilterMode);
      setSelectedFarmId(currentFarmId);
    }
  }, [open, currentFarmId, currentFilterMode]);

  const handleConfirm = () => {
    if (filterMode === "specific" && !selectedFarmId) {
      return; // Não permite confirmar sem selecionar fazenda
    }
    onConfirm(filterMode === "all" ? undefined : selectedFarmId, filterMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Fazenda</DialogTitle>
          <DialogDescription>
            Escolha se deseja mostrar animais de todas as fazendas ou de uma
            fazenda específica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div
              className="flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-muted/50"
              style={{
                borderColor:
                  filterMode === "all" ? "hsl(var(--primary))" : "hsl(var(--border))",
                backgroundColor:
                  filterMode === "all" ? "hsl(var(--primary) / 0.05)" : "transparent",
              }}
              onClick={() => {
                setFilterMode("all");
                setSelectedFarmId(undefined);
              }}
            >
              <Checkbox
                checked={filterMode === "all"}
                onCheckedChange={() => {
                  setFilterMode("all");
                  setSelectedFarmId(undefined);
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
                Fazenda Específica
              </Label>
            </div>
          </div>

          {filterMode === "specific" && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="farm-select" className="text-sm">
                Selecione a Fazenda
              </Label>
              <Select
                value={selectedFarmId || ""}
                onValueChange={setSelectedFarmId}
              >
                <SelectTrigger id="farm-select">
                  <SelectValue placeholder="Selecione uma fazenda" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.farm_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={filterMode === "specific" && !selectedFarmId}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

