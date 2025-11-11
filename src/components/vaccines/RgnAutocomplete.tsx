"use client";

import { Input } from "@/components/ui/input";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export interface RgnOption {
  label: string;
  value: string;
}

interface RgnAutocompleteProps {
  options: RgnOption[];
  value: string;
  onSelect: (rgn: string) => void;
  placeholder?: string;
}

export function RgnAutocomplete({
  options,
  value,
  onSelect,
  placeholder = "Digite o RGN do animal...",
}: RgnAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    if (!open) {
      setSearchTerm(value);
    }
  }, [value, open]);

  const filtered = useMemo(() => {
    if (!searchTerm) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(
      (o) =>
        o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [options, searchTerm]);

  return (
    <div className="w-full relative">
      <Input
        type="text"
        name="rgn"
        id="rgn"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setOpen(true);
        }}
        required
        className="w-full bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md border shadow-lg z-50 max-h-60 overflow-y-auto">
          {filtered.map((option) => (
            <div
              key={option.value}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-muted",
                value === option.value && "bg-muted"
              )}
              onClick={() => {
                onSelect(option.value);
                // Mostra somente o RGN no campo
                setSearchTerm(option.value);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                {value === option.value && <CheckIcon className="h-4 w-4" />}
                {/* Mostrar apenas o RGN na lista */}
                <span>{option.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


