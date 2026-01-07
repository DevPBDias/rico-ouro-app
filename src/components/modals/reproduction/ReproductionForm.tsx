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
import {
  ReproductionEvent,
  EventType,
  ReproductionStatus,
  GestationalStatus,
  OvarySize,
  OvaryStructure,
  CycleStage,
  Diagnostic,
} from "@/types/reproduction_event.type";
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
    event_type: "IATF",
    d0_date: "",
    bull_name: "",
    protocol_name: "",
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

  const calculateCalvingDates = (date: string) => {
    if (!date) return;
    const initialDate = new Date(date);

    const date270 = new Date(initialDate);
    date270.setDate(date270.getDate() + 270);

    const date305 = new Date(initialDate);
    date305.setDate(date305.getDate() + 305);

    handleChange("calving_start_date", date270.toISOString().split("T")[0]);
    handleChange("calving_end_date", date305.toISOString().split("T")[0]);
  };

  const handleTypeChange = (value: EventType) => {
    handleChange("event_type", value);
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
            <Select
              value={formData.event_type}
              onValueChange={(v) => handleTypeChange(v as EventType)}
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IATF">IATF</SelectItem>
                <SelectItem value="FIV">FIV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Data D0 (Inseminação)
            </label>
            <Input
              type="date"
              value={formData.d0_date || ""}
              onChange={(e) => {
                handleChange("d0_date", e.target.value);
              }}
              className="bg-muted border-0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Status Produtivo
            </label>
            <Select
              value={formData.productive_status || ""}
              onValueChange={(v) =>
                handleChange("productive_status", v as ReproductionStatus)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parida">Parida</SelectItem>
                <SelectItem value="solteira">Solteira</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Idade
            </label>
            <Input
              value={formData.age || ""}
              onChange={(e) => handleChange("age", e.target.value)}
              className="bg-muted border-0"
              placeholder="Ex: 36 meses"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Touro
            </label>
            <Input
              value={formData.bull_name || ""}
              onChange={(e) => handleChange("bull_name", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Protocolo
            </label>
            <Input
              value={formData.protocol_name || ""}
              onChange={(e) => handleChange("protocol_name", e.target.value)}
              className="bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Seção Avaliação Produtiva */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Avaliação Produtiva
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Data Avaliação
            </label>
            <Input
              type="date"
              value={formData.evaluation_date || ""}
              onChange={(e) => handleChange("evaluation_date", e.target.value)}
              className="bg-muted border-0"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Score Corporal
            </label>
            <Select
              value={formData.body_score?.toString() || ""}
              onValueChange={(v) =>
                handleChange("body_score", parseInt(v) as 1 | 2 | 3 | 4 | 5)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Condição Gestacional
            </label>
            <Select
              value={formData.gestational_condition || ""}
              onValueChange={(v) =>
                handleChange("gestational_condition", v as GestationalStatus)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prenha">Prenha</SelectItem>
                <SelectItem value="vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Tamanho Ovários
            </label>
            <Select
              value={formData.ovary_size || ""}
              onValueChange={(v) => handleChange("ovary_size", v as OvarySize)}
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="pequeno">Pequeno</SelectItem>
                <SelectItem value="grande">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Estrutura Ovários
            </label>
            <Select
              value={formData.ovary_structure || ""}
              onValueChange={(v) =>
                handleChange("ovary_structure", v as OvaryStructure)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foliculo">Folículo</SelectItem>
                <SelectItem value="corpo_luteo">Corpo Lúteo</SelectItem>
                <SelectItem value="cisto">Cisto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Estágio do Ciclo
            </label>
            <Select
              value={formData.cycle_stage || ""}
              onValueChange={(v) =>
                handleChange("cycle_stage", v as CycleStage)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estro">Estro</SelectItem>
                <SelectItem value="anestro 1">Anestro 1</SelectItem>
                <SelectItem value="anestro 2">Anestro 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Seção Diagnóstico */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Diagnóstico e Previsão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Data D30
            </label>
            <Input
              type="date"
              value={formData.d30_date || ""}
              onChange={(e) => {
                handleChange("d30_date", e.target.value);
                if (formData.diagnostic_d30 === "prenha") {
                  calculateCalvingDates(e.target.value);
                }
              }}
              className="bg-muted border-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Diagnóstico D30
            </label>
            <Select
              value={formData.diagnostic_d30 || ""}
              onValueChange={(val) => {
                handleChange("diagnostic_d30", val as Diagnostic);
                if (val === "prenha") {
                  const baseDate = formData.d30_date || formData.d0_date || "";
                  calculateCalvingDates(baseDate);
                } else if (val === "vazia") {
                  handleChange("calving_start_date", undefined);
                  handleChange("calving_end_date", undefined);
                }
              }}
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Pendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prenha">Prenha</SelectItem>
                <SelectItem value="vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.diagnostic_d30 === "prenha" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Prev. Parto (270d)
              </label>
              <Input
                type="date"
                value={formData.calving_start_date || ""}
                onChange={(e) =>
                  handleChange("calving_start_date", e.target.value)
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
                value={formData.calving_end_date || ""}
                onChange={(e) =>
                  handleChange("calving_end_date", e.target.value)
                }
                className="bg-white h-8 text-xs"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Diagnóstico Final
            </label>
            <Select
              value={formData.final_diagnostic || ""}
              onValueChange={(val) =>
                handleChange("final_diagnostic", val as Diagnostic)
              }
            >
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Pendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prenha">Prenha</SelectItem>
                <SelectItem value="vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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

