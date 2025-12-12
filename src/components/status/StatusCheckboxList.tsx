"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { AnimalStatus } from "@/types/status.type";

interface StatusCheckboxListProps {
  statuses: AnimalStatus[];
  loading: boolean;
  selected: string | null;
  onToggle: (id: string | null) => void;
}

export function StatusCheckboxList({
  statuses,
  loading,
  selected,
  onToggle,
}: StatusCheckboxListProps) {
  return (
    <div className="flex items-start gap-2 w-full">
      <div className="flex-1 rounded-md px-4 py-3 w-full border-0">
        {loading && (
          <div className="text-sm text-foreground/70">
            Carregando status...
          </div>
        )}
        {!loading && statuses.length === 0 && (
          <div className="text-sm text-foreground/70">
            Nenhum status cadastrado
          </div>
        )}
        {!loading && statuses.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
              const checked = selected === status.status_name;
              return (
                <label
                  key={status.id}
                  className="flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={checked}
                    className="border-primary"
                    onCheckedChange={(val) => onToggle(val ? status.status_name : null)}
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
