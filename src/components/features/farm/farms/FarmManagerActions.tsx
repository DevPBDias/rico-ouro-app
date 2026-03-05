"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface FarmManagerActionsProps {
  onAddClick: () => void;
  onDeleteClick: () => void;
  disabled: boolean;
}

export function FarmManagerActions({
  onAddClick,
  onDeleteClick,
  disabled,
}: FarmManagerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onAddClick}
        title="Adicionar nova fazenda"
      >
        <Plus color="blue" size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDeleteClick}
        disabled={disabled}
        title="Deletar fazenda"
      >
        <Trash color="red" size={16} />
      </Button>
    </div>
  );
}
