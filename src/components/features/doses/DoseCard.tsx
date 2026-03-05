"use client";

import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SemenDose } from "@/types/semen_dose.type";

interface DoseCardProps {
  dose: SemenDose;
  onEdit: () => void;
  onDelete: () => void;
}

export function DoseCard({ dose, onEdit, onDelete }: DoseCardProps) {
  const isBullNelore =
    dose.breed.toLowerCase() === "nelore" ||
    dose.breed.toLowerCase() === "nelore pintado";

  return (
    <div className="flex items-stretch gap-3 py-2 px-3 rounded-xl border shadow-sm w-full uppercase overflow-hidden">
      <div className="flex flex-col justify-start items-start w-full gap-2.5 min-w-0">
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <h3 className="font-bold text-primary text-base truncate flex-1 min-w-0">
            {dose.animal_name}
          </h3>
          <p className="text-base px-2 py-0.5 border border-primary font-bold text-primary rounded-md whitespace-nowrap flex-shrink-0">
            {dose.quantity}{" "}
            <span className="text-xs lowercase font-medium text-muted-foreground">
              doses
            </span>
          </p>
        </div>

        <div className="flex flex-row justify-start items-start w-full rounded-lg gap-2">
          {dose.animal_image ? (
            <Image
              src={dose.animal_image}
              alt={dose.animal_name || "Animal"}
              width={160}
              height={112}
              className="object-cover w-40 h-27 rounded-lg flex-shrink-0"
              unoptimized
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-40 h-28 flex items-center justify-center bg-muted rounded-lg flex-shrink-0">
              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-col justify-start items-start gap-1">
            <p className="flex flex-col justify-start items-start gap-0.5 text-xs text-primary font-bold w-full min-w-0">
              <span className="font-bold text-[10px] text-muted-foreground">
                Pai:
              </span>
              <span className="truncate w-full">
                {dose.father_name || "Sem pai"}
              </span>
            </p>
            <p className="flex flex-col justify-start text-xs items-start gap-0.5 text-primary font-bold w-full min-w-0">
              <span className="font-bold text-[10px] text-muted-foreground">
                Avô materno:
              </span>
              <span className="truncate w-full">
                {dose.maternal_grandfather_name || "Sem avô"}
              </span>
            </p>
            <p className="flex flex-row items-end gap-1 justify-start text-xs text-primary font-bold w-full min-w-0">
              <span className="font-bold text-[10px] text-muted-foreground">
                Registro:
              </span>{" "}
              <span className="truncate inline-block w-full">
                {dose.registration || "Sem registro"}
              </span>
            </p>
            <p className="flex flex-row items-end gap-1 justify-start text-xs text-primary font-bold w-full min-w-0">
              <span className="font-bold text-[10px] text-muted-foreground">
                Central:
              </span>{" "}
              <span className="truncate inline-block w-full">
                {dose.center_name || "Sem centro"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-1 w-full">
          {isBullNelore && (
            <p className="flex flex-row items-end gap-1 justify-start w-full min-w-0 text-xs text-primary font-bold">
              <span className="font-bold text-[10px] text-muted-foreground">
                iABCZ:
              </span>{" "}
              <span className="truncate inline-block">
                {dose.iabcz || "Sem indice"}
              </span>
            </p>
          )}
          <div className="flex items-center justify-start gap-2 ml-auto flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:bg-primary/10 rounded-md border border-primary"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md border border-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
