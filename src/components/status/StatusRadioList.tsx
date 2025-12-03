"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { IStatus } from "@/types/status-type";

interface StatusRadioListProps {
  statuses: IStatus[];
  loading: boolean;
  selected: IStatus | null;
  onSelect: (status: IStatus | null) => void;
}

export function StatusRadioList({
  statuses,
  loading,
  selected,
  onSelect,
}: StatusRadioListProps) {
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
            Nenhum status disponível
          </div>
        )}
        {!loading && statuses.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
              const isSelected = selected === status;
              return (
                <label
                  key={status}
                  className="flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={isSelected}
                    className="border-primary"
                    onCheckedChange={(val) => {
                      if (val && isSelected) {
                        onSelect(null);
                      } else {
                        onSelect(val ? status : null);
                      }
                    }}
                    aria-label={status}
                  />
                  <span className="text-sm uppercase text-primary font-medium">
                    {status}
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
