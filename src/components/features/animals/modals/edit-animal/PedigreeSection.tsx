"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Animal } from "@/types/animal.type";

interface Props {
  formData: Animal;
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
            name="mother_serie_rgd"
            value={formData.mother_serie_rgd ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Mãe (RGN)
          </Label>
          <Input
            name="mother_rgn"
            value={formData.mother_rgn ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Pai
          </Label>
          <Input
            name="father_name"
            value={formData.father_name ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Avô materno
          </Label>
          <Input
            name="maternal_grandfather_name"
            value={formData.maternal_grandfather_name ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Avô paterno
          </Label>
          <Input
            name="paternal_grandfather_name"
            value={formData.paternal_grandfather_name ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default GenealogiaSection;
