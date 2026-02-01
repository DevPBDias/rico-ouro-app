"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimalSituation } from "@/types/situation.type";

interface SituationCheckboxListProps {
  situations: AnimalSituation[];
  loading: boolean;
  selected: string[];
  onToggle: (names: string[]) => void;
}

export function SituationCheckboxList({
  situations,
  loading,
  selected,
  onToggle,
}: SituationCheckboxListProps) {
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
          <div className="text-sm text-foreground/70">Carregando situações...</div>
        )}
        {!loading && situations.length === 0 && (
          <div className="text-sm text-foreground/70">
            Nenhuma situação cadastrada
          </div>
        )}
        {!loading && situations.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {situations.map((situation) => {
              const isChecked = selected.includes(situation.situation_name);
              const isDisabled = !isChecked && selected.length >= 2;

              return (
                <label
                  key={situation.id}
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
                      handleToggle(situation.situation_name, !!val)
                    }
                    aria-label={situation.situation_name}
                  />
                  <span className="text-sm uppercase text-primary font-medium">
                    {situation.situation_name}
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
