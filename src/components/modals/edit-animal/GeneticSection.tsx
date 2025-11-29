"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimalData } from "@/types/schemas.types";

interface Props {
  formData: AnimalData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving: boolean;
}

const DadosGeneticosSection = ({ formData, handleChange, isSaving }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="uppercase font-bold text-primary text-base pb-1 border-[#1162AE] border-b w-full">
          Dados Genéticos
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            iABCZg
          </Label>
          <Input
            name="animal.iabcgz"
            value={formData.animal.iabcgz ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            DECA
          </Label>
          <Input
            name="animal.deca"
            value={formData.animal.deca ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            P%
          </Label>
          <Input
            name="animal.p"
            value={formData.animal.p ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            F%
          </Label>
          <Input
            name="animal.f"
            value={formData.animal.f ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Cor Nascimento
          </Label>
          <Input
            name="animal.corNascimento"
            value={formData.animal.corNascimento ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div>
          <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
            Status
          </Label>
          <Input
            name="animal.status"
            value={formData.animal.status?.value ?? ""}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default DadosGeneticosSection;
