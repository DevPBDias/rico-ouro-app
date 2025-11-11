"use client";

import { Checkbox } from "@/components/ui/checkbox";

type VaccineItem = { id?: number; vaccineName: string };

interface VaccinesMultiSelectProps {
  vaccines: VaccineItem[];
  loading: boolean;
  selected: string[];
  onToggle: (name: string, checked: boolean) => void;
}

export function VaccinesMultiSelect({
  vaccines,
  loading,
  selected,
  onToggle,
}: VaccinesMultiSelectProps) {
  return (
    <div className="flex items-start gap-2 w-full">
      <div className="flex-1 rounded-md px-4 py-3 w-full border-0">
        {loading && (
          <div className="text-sm text-foreground/70">
            Carregando vacinas...
          </div>
        )}
        {!loading && vaccines.length === 0 && (
          <div className="text-sm text-foreground/70">
            Nenhuma vacina cadastrada
          </div>
        )}
        {!loading && vaccines.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {vaccines.map((vaccine) => {
              const name = vaccine.vaccineName;
              const checked = selected.includes(name);
              return (
                <label
                  key={`${vaccine.id ?? name}`}
                  className="flex items-center bg-muted rounded-md px-3 py-2 gap-3 text-sm cursor-pointer select-none"
                >
                  <Checkbox
                    checked={checked}
                    className="border-primary"
                    onCheckedChange={(val) => onToggle(name, Boolean(val))}
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
