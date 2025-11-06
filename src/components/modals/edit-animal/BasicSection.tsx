"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimalData } from "@/lib/db";

interface Props {
  formData: AnimalData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
}

const DadosBasicosSection = ({ formData, handleChange, isSaving }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="uppercase font-bold text-primary text-base pb-1 border-[#1162AE] border-b w-full">
          Dados Básicos
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 mb-1">
            Fazenda
          </Label>
          <Input
            name="animal.farm"
            value={formData.animal.farm ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 mb-1">
            Sexo
          </Label>
          <Input
            name="animal.sexo"
            value={formData.animal.sexo ?? ""}
            onChange={handleChange}
            placeholder="M ou F"
            disabled={isSaving}
          />
        </div>

        <div className="col-span-2">
          <Label className="text-xs uppercase font-semibold  text-gray-600 mb-1">
            Data de Nascimento
          </Label>
          <Input
            type="date"
            name="animal.nasc"
            value={formData.animal.nasc ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default DadosBasicosSection;
