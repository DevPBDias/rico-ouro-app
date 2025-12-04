"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Farm } from "@/types/farm.type";

interface FarmsCheckboxListProps {
  farms: Farm[];
  loading: boolean;
  selected: string | null;
  onToggle: (id: string | null) => void;
}

export function FarmsCheckboxList({
  farms,
  loading,
  selected,
  onToggle,
}: FarmsCheckboxListProps) {
  return (
    <div className="flex items-start gap-2 w-full">
      <div className="flex-1 rounded-md px-4 py-3 w-full border-0">
        {loading && (
          <div className="text-sm text-foreground/70">
            Carregando fazendas...
          </div>
        )}
        {!loading && farms.length === 0 && (
          <div className="text-sm text-foreground/70">
            Nenhuma fazenda cadastrada
          </div>
        )}
        {!loading && farms.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {farms.map((farm) => {
              const checked = selected === farm.id;
              return (
                <label
                  key={farm.id}
                  className="flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={checked}
                    className="border-primary"
                    onCheckedChange={(val) => onToggle(val ? farm.id : null)}
                    aria-label={farm.farm_name}
                  />
                  <span className="text-sm uppercase text-primary font-medium">
                    {farm.farm_name}
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
