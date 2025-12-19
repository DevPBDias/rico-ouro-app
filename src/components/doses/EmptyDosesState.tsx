"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDosesStateProps {
  hasFilter?: boolean;
  filterValue?: string | null;
  onClearFilter?: () => void;
  onAddClick?: () => void;
}

export function EmptyDosesState({
  hasFilter = false,
  filterValue,
  onClearFilter,
  onAddClick,
}: EmptyDosesStateProps) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">
          Nenhum resultado
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Não há doses cadastradas para a raça{" "}
          <span className="font-semibold">&quot;{filterValue}&quot;</span>
        </p>
        {onClearFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilter}
          >
            Limpar Filtro
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        Nenhuma dose cadastrada
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
        Comece adicionando o estoque de doses de sêmen dos seus animais
      </p>
      {onAddClick && (
        <Button onClick={onAddClick} className="gap-2">
          <Package className="h-4 w-4" />
          Adicionar Primeiro Animal
        </Button>
      )}
    </div>
  );
}
