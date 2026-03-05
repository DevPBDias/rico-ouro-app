"use client";

import { SituationCheckboxList } from "./SituationCheckboxList";
import { SituationManagerActions } from "./SituationManagerActions";
import { AnimalSituation } from "@/types/situation.type";

interface SituationSelectorProps {
  situations: AnimalSituation[];
  loading: boolean;
  selectedSituationNames: string[];
  onToggle: (names: string[]) => void;
  onAddClick: () => void;
  onDeleteClick: () => void;
}

export function SituationSelector({
  situations,
  loading,
  selectedSituationNames,
  onToggle,
  onAddClick,
  onDeleteClick,
}: SituationSelectorProps) {
  return (
    <div className="flex flex-col justify-start items-start w-full gap-2">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <label
          htmlFor="situation"
          className="text-primary font-bold text-sm uppercase w-full text-left"
        >
          Situação:
        </label>
        <SituationManagerActions
          onAddClick={onAddClick}
          onDeleteClick={onDeleteClick}
          disabled={situations.length === 0}
        />
      </div>
      <SituationCheckboxList
        situations={situations}
        loading={loading}
        selected={selectedSituationNames}
        onToggle={onToggle}
      />
    </div>
  );
}
