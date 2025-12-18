"use client";

import { Check } from "lucide-react";

interface PartnershipSelectorProps {
  selectedPartnershipNames: string[];
  onToggle: (name: string) => void;
}

const PARTNERSHIP_OPTIONS = ["Alex", "Fátima", "Jacir", "Ricardo"];

export function PartnershipSelector({
  selectedPartnershipNames,
  onToggle,
}: PartnershipSelectorProps) {
  return (
    <div className="flex flex-col justify-start items-start w-full gap-2">
      <label className="text-primary font-bold text-sm uppercase w-full text-left">
        Sociedades:
      </label>
      <div className="grid grid-cols-1 gap-3 w-full">
        {PARTNERSHIP_OPTIONS.map((name) => {
          const isSelected = selectedPartnershipNames.includes(name);

          return (
            <button
              key={name}
              type="button"
              onClick={() => onToggle(name)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.01] active:scale-[0.99] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span
                className={`text-sm font-medium capitalize transition-colors ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {name}
              </span>

              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && (
                  <Check className="h-3.5 w-3.5" strokeWidth={4} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
