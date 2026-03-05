"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

interface StatusManagerActionsProps {
  onAddClick: () => void;
  onDeleteClick: () => void;
  disabled: boolean;
}

export function StatusManagerActions({
  onAddClick,
  onDeleteClick,
  disabled,
}: StatusManagerActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onAddClick}
        title="Adicionar novo status"
      >
        <Plus color="blue" size={16} />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onDeleteClick}
        disabled={disabled}
        title="Deletar status"
      >
        <Trash color="red" size={16} />
      </Button>
    </div>
  );
}
