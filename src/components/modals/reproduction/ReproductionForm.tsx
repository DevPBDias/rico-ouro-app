"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { Loader2 } from "lucide-react";

interface ReproductionFormProps {
  initialData?: Partial<ReproductionEvent>;
  onSubmit: (data: Partial<ReproductionEvent>) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  onCancel: () => void;
}

export function ReproductionForm({
  initialData,
  onSubmit,
  isLoading,
  isEdit,
  onCancel,
}: ReproductionFormProps) {
  const [formData, setFormData] = useState<Partial<ReproductionEvent>>({
    type: "IATF",
    date: "",
    weight: "",
    bull: "",
    rgn_bull: "",
    donor: "",
    gestation_diagnostic_date: "",
    gestation_diagnostic_type: undefined,
    expected_sex: undefined,
    expected_birth_date_270: "",
    expected_birth_date_305: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field: keyof ReproductionEvent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateBirthDates = (date: string) => {
    if (!date) return;
    const initialDate = new Date(date);

    // 290 dias de gestação média
    const date270 = new Date(initialDate);
    date270.setDate(date270.getDate() + 270);

    const date305 = new Date(initialDate);
    date305.setDate(date305.getDate() + 305);

    handleChange(
      "expected_birth_date_270",
      date270.toISOString().split("T")[0]
    );
    handleChange(
      "expected_birth_date_305",
      date305.toISOString().split("T")[0]
    );
  };

  const handleTypeChange = (value: string) => {
    handleChange("type", value);
    if (value !== "FIV-TETF") {
      handleChange("donor", "");
    }
  };

  const cleanData = (data: Partial<ReproductionEvent>) => {
    const cleaned = { ...data };
    (Object.keys(cleaned) as Array<keyof ReproductionEvent>).forEach((key) => {
      if (cleaned[key] === "") {
        // @ts-ignore
        cleaned[key] = undefined;
      }
    });
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cleanData(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seção Principal */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Dados do Evento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Tipo
            </label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IATF">IATF</SelectItem>
                <SelectItem value="MONTA NATURAL">Monta Natural</SelectItem>
                <SelectItem value="FIV-TETF">FIV-TETF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Data
            </label>
            <Input
              type="date"
              value={formData.date || ""}
              onChange={(e) => {
                handleChange("date", e.target.value);
              }}
              className="bg-muted border-0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Peso (kg)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.weight || ""}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Touro
            </label>
            <Input
              value={formData.bull || ""}
              onChange={(e) => handleChange("bull", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              RGN Touro
            </label>
            <Input
              value={formData.rgn_bull || ""}
              onChange={(e) => handleChange("rgn_bull", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
        </div>

        {formData.type === "FIV-TETF" && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Doadora
            </label>
            <Input
              value={formData.donor || ""}
              onChange={(e) => handleChange("donor", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
        )}
      </div>

      {/* Seção Diagnóstico */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Diagnóstico e Previsão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Data Diagnóstico
            </label>
            <Input
              type="date"
              value={formData.gestation_diagnostic_date || ""}
              onChange={(e) =>
                handleChange("gestation_diagnostic_date", e.target.value)
              }
              className="bg-muted border-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Resultado
            </label>
            <Select
              value={formData.gestation_diagnostic_type || ""}
              onValueChange={(val) => {
                handleChange("gestation_diagnostic_type", val);
                if (val === "Prenha" && formData.date) {
                  calculateBirthDates(formData.date);
                } else if (val === "Vazia") {
                  handleChange("expected_birth_date_270", undefined);
                  handleChange("expected_birth_date_305", undefined);
                }
              }}
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Pendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prenha">Prenha</SelectItem>
                <SelectItem value="Vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.gestation_diagnostic_type === "Prenha" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary uppercase">
                Sexo Esperado
              </label>
              <Select
                value={formData.expected_sex || ""}
                onValueChange={(val) => handleChange("expected_sex", val)}
              >
                <SelectTrigger className="bg-muted border-0">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Macho</SelectItem>
                  <SelectItem value="F">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Prev. Parto (270d)
                </label>
                <Input
                  type="date"
                  value={formData.expected_birth_date_270 || ""}
                  onChange={(e) =>
                    handleChange("expected_birth_date_270", e.target.value)
                  }
                  className="bg-white h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Prev. Parto (305d)
                </label>
                <Input
                  type="date"
                  value={formData.expected_birth_date_305 || ""}
                  onChange={(e) =>
                    handleChange("expected_birth_date_305", e.target.value)
                  }
                  className="bg-white h-8 text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 font-bold uppercase"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Salvar Alterações" : "Cadastrar Evento"}
        </Button>
      </div>
    </form>
  );
}
