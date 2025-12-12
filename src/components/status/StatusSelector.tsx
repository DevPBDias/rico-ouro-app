"use client";

import { StatusCheckboxList } from "./StatusCheckboxList";
import { StatusManagerActions } from "./StatusManagerActions";
import { AnimalStatus } from "@/types/status.type";

interface StatusSelectorProps {
  statuses: AnimalStatus[];
  loading: boolean;
  selectedStatusName: string | null;
  onToggle: (name: string | null) => void;
  onAddClick: () => void;
  onDeleteClick: () => void;
}

export function StatusSelector({
  statuses,
  loading,
  selectedStatusName,
  onToggle,
  onAddClick,
  onDeleteClick,
}: StatusSelectorProps) {
  return (
    <div className="flex flex-col justify-start items-start w-full gap-2">
      <div className="flex flex-row justify-between items-center w-full gap-2">
        <label
          htmlFor="status"
          className="text-primary font-bold text-sm uppercase w-full text-left"
        >
          Status:
        </label>
        <StatusManagerActions
          onAddClick={onAddClick}
          onDeleteClick={onDeleteClick}
          disabled={statuses.length === 0}
        />
      </div>
      <StatusCheckboxList
        statuses={statuses}
        loading={loading}
        selected={selectedStatusName}
        onToggle={onToggle}
      />
    </div>
  );
}
