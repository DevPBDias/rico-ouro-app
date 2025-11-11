"use client";

import { Checkbox } from "@/components/ui/checkbox";

type FarmItem = { id?: number; farmName: string };

interface FarmsCheckboxListProps {
  farms: FarmItem[];
  loading: boolean;
  selected: string | null;
  onToggle: (name: string | null) => void;
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
              const name = farm.farmName;
              const checked = selected?.toLowerCase() === name.toLowerCase();
              return (
                <label
                  key={`${farm.id ?? name}`}
                  className="flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={checked}
                    className="border-primary"
                    onCheckedChange={(val) => onToggle(val ? name : null)}
                    aria-label={name}
                  />
                  <span className="text-sm uppercase text-primary font-medium">
                    {name}
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

