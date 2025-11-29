"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimalData } from "@/types/schemas.types";

interface Props {
  formData: AnimalData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
}

const GenealogiaSection = ({ formData, handleChange, isSaving }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="uppercase font-bold text-primary text-base pb-1 border-[#1162AE] border-b w-full">
          Genealogia
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Mãe (Série RGD)
          </Label>
          <Input
            name="mae.serieRGD"
            value={formData.mae?.serieRGD ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Mãe (RGN)
          </Label>
          <Input
            name="mae.rgn"
            value={formData.mae?.rgn ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Pai
          </Label>
          <Input
            name="pai.nome"
            value={formData.pai?.nome ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Avo materno
          </Label>
          <Input
            name="avoMaterno.nome"
            value={formData.avoMaterno?.nome ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default GenealogiaSection;
