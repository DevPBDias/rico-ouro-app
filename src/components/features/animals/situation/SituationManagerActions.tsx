"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface SituationManagerActionsProps {
  onAddClick: () => void;
  onDeleteClick: () => void;
  disabled: boolean;
}

export function SituationManagerActions({
  onAddClick,
  onDeleteClick,
  disabled,
}: SituationManagerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onAddClick}
        title="Adicionar nova situação"
      >
        <Plus color="blue" size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDeleteClick}
        disabled={disabled}
        title="Deletar situação"
      >
        <Trash color="red" size={16} />
      </Button>
    </div>
  );
}
