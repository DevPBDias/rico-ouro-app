"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimalData } from "@/types/schemas.types";
import { TrashIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  formData: AnimalData;
  setFormData: React.Dispatch<React.SetStateAction<AnimalData>>;
  isSaving: boolean;
}

const VacinasSection = ({ formData, setFormData, isSaving }: Props) => {
  const handleVacinaChange = (
    index: number,
    field: "nome" | "data",
    value: string
  ) => {
    const newVacinas = [...(formData.animal.vacinas ?? [])];
    newVacinas[index] = { ...newVacinas[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      animal: { ...prev.animal, vacinas: newVacinas },
    }));
  };

  const addVacina = () => {
    setFormData((prev) => ({
      ...prev,
      animal: {
        ...prev.animal,
        vacinas: [...(prev.animal.vacinas ?? []), { nome: "", data: "" }],
      },
    }));
  };

  const removeVacina = (index: number) => {
    const newVacinas = (formData.animal.vacinas ?? []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      animal: { ...prev.animal, vacinas: newVacinas },
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="uppercase font-bold text-primary text-base flex items-center gap-1 my-1 pb-1 border-[#1162AE] border-b">
        Vacinas
      </Label>

      {(formData.animal.vacinas ?? []).map((vacina, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-primary mt-2">
            {index + 1} - Registro de vacina
          </h4>

          <div className="flex gap-2 items-end">
            {/* Select de nome da vacina */}
            <div className="flex-1">
              <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
                Vacina
              </Label>
              <Select
                value={vacina.nome ?? ""}
                onValueChange={(value) =>
                  handleVacinaChange(index, "nome", value)
                }
                disabled={isSaving}
              >
                <SelectTrigger className="w-full bg-muted border border-gray-300 rounded-md px-4 py-2 text-sm">
                  <SelectValue placeholder="Selecione a vacina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Aftosa">Aftosa</SelectItem>
                    <SelectItem value="Brucelose">Brucelose</SelectItem>
                    <SelectItem value="Raiva">Raiva</SelectItem>
                    <SelectItem value="Clostridiose">Clostridiose</SelectItem>
                    <SelectItem value="Vermifugação">Vermifugação</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Botão de remover */}
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeVacina(index)}
              disabled={isSaving}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Campo de data */}
          <div className="flex-1">
            <Label className="text-xs uppercase font-semibold text-gray-600 flex items-center gap-1 mb-1">
              Data
            </Label>
            <Input
              type="date"
              value={vacina.data ?? ""}
              onChange={(e) =>
                handleVacinaChange(index, "data", e.target.value)
              }
              disabled={isSaving}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        onClick={addVacina}
        className="mt-2 bg-[#1162AE] hover:bg-[#0e4d8a] uppercase text-sm font-semibold"
        disabled={isSaving}
      >
        + Adicionar Vacina
      </Button>
    </div>
  );
};

export default VacinasSection;
