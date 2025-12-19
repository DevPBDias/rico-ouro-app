"use client";

import { SemenDose } from "@/types/semen_dose.type";
import { DoseCard } from "./DoseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { EmptyDosesState } from "./EmptyDosesState";

interface DosesListProps {
  groupedDoses: Map<string, SemenDose[]>;
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  selectedBreed: string | null;
}

function BreedGroup({
  breed,
  doses,
  onEdit,
  onDelete,
}: {
  breed: string;
  doses: SemenDose[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalQuantity = doses.reduce((sum, d) => sum + d.quantity, 0);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-primary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-primary" />
          )}
          <span className="font-bold text-primary uppercase text-sm">
            {breed}
          </span>
          <span className="text-xs text-muted-foreground">
            ({doses.length} {doses.length === 1 ? "animal" : "animais"})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="font-bold text-primary tabular-nums">
            {totalQuantity}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {doses.map((dose) => (
            <DoseCard
              key={dose.id}
              dose={dose}
              onEdit={() => onEdit(dose.id)}
              onDelete={() => onDelete(dose.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[1, 2].map((groupIdx) => (
        <div key={groupIdx}>
          <Skeleton className="h-12 w-full rounded-lg mb-2" />
          {[1, 2, 3].map((cardIdx) => (
            <Skeleton key={cardIdx} className="h-16 w-full rounded-xl mb-2" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DosesList({
  groupedDoses,
  isLoading,
  onEdit,
  onDelete,
  selectedBreed,
}: DosesListProps) {
  useEffect(() => {
    if (
      !isLoading &&
      groupedDoses.size > 0 &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const imageUrls = Array.from(groupedDoses.values())
        .flat()
        .map((dose) => dose.animal_image)
        .filter((url): url is string => !!url);

      if (imageUrls.length > 0) {
        const sendToSW = (sw: ServiceWorker) => {
          sw.postMessage({
            type: "CACHE_DYNAMIC_ROUTES",
            urls: imageUrls,
          });
          console.log(
            `[DosesList] Solicitado pré-cache de ${imageUrls.length} imagens`
          );
        };

        if (navigator.serviceWorker.controller) {
          sendToSW(navigator.serviceWorker.controller);
        } else {
          navigator.serviceWorker.ready.then((registration) => {
            if (registration.active) sendToSW(registration.active);
          });
        }
      }
    }
  }, [isLoading, groupedDoses]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const breeds = Array.from(groupedDoses.keys()).sort();

  if (breeds.length === 0) {
    return (
      <EmptyDosesState
        hasFilter={selectedBreed !== null}
        filterValue={selectedBreed}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      {breeds.map((breed) => (
        <BreedGroup
          key={breed}
          breed={breed}
          doses={groupedDoses.get(breed) || []}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
