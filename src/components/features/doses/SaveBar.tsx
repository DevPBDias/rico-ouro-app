"use client";

import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface SaveBarProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  changeCount?: number;
}

export function SaveBar({
  onSave,
  onCancel,
  isSaving = false,
  changeCount = 0,
}: SaveBarProps) {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t shadow-lg
        px-4 py-3
        animate-in slide-in-from-bottom-5 duration-300
      "
    >
      {changeCount > 0 && (
        <div className="text-center text-xs text-muted-foreground mb-2">
          {changeCount}{" "}
          {changeCount === 1 ? "alteração pendente" : "alterações pendentes"}
        </div>
      )}

      <div className="flex gap-3 max-w-lg mx-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 gap-2 font-semibold uppercase text-xs py-5"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 gap-2 font-semibold uppercase text-xs py-5 shadow-lg shadow-primary/20"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
