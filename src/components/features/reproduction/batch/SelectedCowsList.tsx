"use client";

import { X } from "lucide-react";
import { Animal } from "@/types/animal.type";
import { Button } from "@/components/ui/button";

interface SelectedCowsListProps {
  cows: Animal[];
  onRemove: (rgn: string) => void;
  onClear: () => void;
}

export function SelectedCowsList({ cows, onRemove, onClear }: SelectedCowsListProps) {
  if (cows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed rounded-xl">
        <p className="text-muted-foreground font-medium text-center">
          Nenhuma matriz selecionada.
          <br />
          <span className="text-sm font-normal">
            Digite o RGN acima e pressione Enter para adicionar.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          Selecionadas ({cows.length})
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          Limpar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {cows.map((cow) => (
          <div
            key={cow.rgn}
            className="flex items-center justify-between p-3 bg-card border border-border shadow-sm rounded-lg hover:border-primary/30 transition-colors"
          >
            <div className="truncate pr-2">
              <p className="font-bold text-primary truncate leading-none mb-1">
                {cow.rgn}
              </p>
              {cow.name && (
                <p className="text-xs text-muted-foreground truncate">
                  {cow.name}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(cow.rgn as string)}
              className="shrink-0 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Remover matriz"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
