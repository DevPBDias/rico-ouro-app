"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimalStatus } from "@/types/status.type";

interface StatusCheckboxListProps {
  statuses: AnimalStatus[];
  loading: boolean;
  selected: string[];
  onToggle: (names: string[]) => void;
}

export function StatusCheckboxList({
  statuses,
  loading,
  selected,
  onToggle,
}: StatusCheckboxListProps) {
  const handleToggle = (name: string, checked: boolean) => {
    if (checked) {
      if (selected.length < 2) {
        onToggle([...selected, name]);
      }
    } else {
      onToggle(selected.filter((s) => s !== name));
    }
  };

  return (
    <div className="flex items-start gap-2 w-full">
      <div className="flex-1 rounded-md px-4 py-3 w-full border-0">
        {loading && (
          <div className="text-sm text-foreground/70">Carregando status...</div>
        )}
        {!loading && statuses.length === 0 && (
          <div className="text-sm text-foreground/70">
            Nenhum status cadastrado
          </div>
        )}
        {!loading && statuses.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
              const isChecked = selected.includes(status.status_name);
              const isDisabled = !isChecked && selected.length >= 2;

              return (
                <label
                  key={status.id}
                  className={cn(
                    "flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none transition-opacity",
                    isDisabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={isDisabled}
                    className="border-primary"
                    onCheckedChange={(val) =>
                      handleToggle(status.status_name, !!val)
                    }
                    aria-label={status.status_name}
                  />
                  <span className="text-sm uppercase text-primary font-medium">
                    {status.status_name}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
