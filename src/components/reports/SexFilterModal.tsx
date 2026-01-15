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
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GenderFilterValue } from "@/lib/pdf/definitions/types";

interface SexFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSex?: GenderFilterValue;
  currentFilterMode?: "all" | "specific";
  onConfirm: (
    sex: GenderFilterValue | undefined,
    filterMode: "all" | "specific"
  ) => void;
}

export function SexFilterModal({
  open,
  onOpenChange,
  currentSex,
  currentFilterMode = "all",
  onConfirm,
}: SexFilterModalProps) {
  const [filterMode, setFilterMode] = React.useState<"all" | "specific">(
    currentFilterMode
  );
  const [selectedSex, setSelectedSex] = React.useState<
    GenderFilterValue | undefined
  >(currentSex);

  React.useEffect(() => {
    if (open) {
      setFilterMode(currentFilterMode);
      setSelectedSex(currentSex);
    }
  }, [open, currentSex, currentFilterMode]);

  const handleConfirm = () => {
    if (filterMode === "specific" && !selectedSex) {
      return; // Não permite confirmar sem selecionar sexo
    }
    onConfirm(filterMode === "all" ? "Ambos" : selectedSex, filterMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Sexo</DialogTitle>
          <DialogDescription>
            Escolha se deseja mostrar animais de ambos os sexos ou filtrar por
            um sexo específico.
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
                setSelectedSex("Ambos");
              }}
            >
              <Checkbox
                checked={filterMode === "all"}
                onCheckedChange={() => {
                  setFilterMode("all");
                  setSelectedSex("Ambos");
                }}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Ambos (Macho e Fêmea)
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
                Sexo Específico
              </Label>
            </div>
          </div>

          {filterMode === "specific" && (
            <Select
              value={selectedSex || ""}
              onValueChange={(value) =>
                setSelectedSex(value as GenderFilterValue)
              }
            >
              <SelectTrigger id="sex-select" className="w-full text-black">
                Selecione o sexo
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Macho</SelectItem>
                <SelectItem value="F">Fêmea</SelectItem>
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
            disabled={filterMode === "specific" && !selectedSex}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
