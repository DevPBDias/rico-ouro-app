"use client";

import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";

interface AnimalSelectorProps {
  rgnOptions: Array<{ label: string; value: string }>;
  selectedRgn: string;
  onSelect: (rgn: string) => void;
}

export function AnimalSelector({
  rgnOptions,
  selectedRgn,
  onSelect,
}: AnimalSelectorProps) {
  return (
    <div className="flex flex-col justify-start items-start w-full gap-2 relative">
      <label
        htmlFor="rgn"
        className="text-primary font-bold text-sm uppercase w-full text-left"
      >
        Animal (RGN):
      </label>
      <RgnAutocomplete
        options={rgnOptions}
        value={selectedRgn}
        onSelect={onSelect}
      />
    </div>
  );
}
