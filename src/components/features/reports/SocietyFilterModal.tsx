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

interface SocietyFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  societies: string[];
  currentSociety?: string;
  currentFilterMode?: "all" | "specific";
  onConfirm: (
    society: string | undefined,
    filterMode: "all" | "specific"
  ) => void;
}

export function SocietyFilterModal({
  open,
  onOpenChange,
  societies,
  currentSociety,
  currentFilterMode = "all",
  onConfirm,
}: SocietyFilterModalProps) {
  const [filterMode, setFilterMode] = React.useState<"all" | "specific">(
    currentFilterMode
  );
  const [selectedSociety, setSelectedSociety] = React.useState<
    string | undefined
  >(currentSociety);

  React.useEffect(() => {
    if (open) {
      setFilterMode(currentFilterMode);
      setSelectedSociety(currentSociety);
    }
  }, [open, currentSociety, currentFilterMode]);

  const handleConfirm = () => {
    if (filterMode === "specific" && !selectedSociety) {
      return; 
    }
    onConfirm(filterMode === "all" ? undefined : selectedSociety, filterMode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Sociedade</DialogTitle>
          <DialogDescription>
            Escolha se deseja mostrar animais de todas as sociedades ou filtrar por
            uma sociedade específica.
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
                setSelectedSociety(undefined);
              }}
            >
              <Checkbox
                checked={filterMode === "all"}
                onCheckedChange={() => {
                  setFilterMode("all");
                  setSelectedSociety(undefined);
                }}
                className="h-5 w-5"
              />
              <Label className="text-sm font-medium cursor-pointer flex-1">
                Todas as Sociedades
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
                Sociedade Específica
              </Label>
            </div>
          </div>

          {filterMode === "specific" && (
            <Select
              value={selectedSociety || ""}
              onValueChange={setSelectedSociety}
            >
              <SelectTrigger id="society-select" className="w-full text-black">
                {selectedSociety || "Selecione uma sociedade"}
              </SelectTrigger>
              <SelectContent>
                {societies.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    Nenhuma sociedade encontrada
                  </div>
                ) : (
                  societies.map((society) => (
                    <SelectItem key={society} value={society}>
                      {society}
                    </SelectItem>
                  ))
                )}
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
            disabled={filterMode === "specific" && !selectedSociety}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
