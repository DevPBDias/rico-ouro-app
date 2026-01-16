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
  OvarySize,
  OvaryStructure,
  CycleStage,
  Diagnostic,
  PregnancyOrigin,
} from "@/types/reproduction_event.type";
import { Loader2 } from "lucide-react";
import { SemenDoseSelector } from "@/components/doses/SemenDoseSelector";

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

  const calculateCalvingDates = (
    origin: PregnancyOrigin,
    dates: Partial<ReproductionEvent>,
  ) => {
    let startBase: string | undefined;
    let endBase: string | undefined;

    switch (origin) {
      case "d0":
        startBase = endBase = dates.d0_date;
        break;
      case "resync":
        startBase = endBase = dates.d32_date;
        break;
      case "natural_mating":
        startBase = dates.natural_mating_d35_entry;
        endBase = dates.natural_mating_d80_exit;
        break;
    }

    if (!startBase || !endBase) return {};

    // Função auxiliar para adicionar dias sem problemas de timezone
    const addDays = (dateStr: string, days: number): string => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + days);

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const daysToAdd = origin === "natural_mating" ? 280 : 315;

    return {
      calving_start_date: addDays(startBase, 280),
      calving_end_date: addDays(endBase, daysToAdd),
    };
  };

  const calculateDServices = (d0Date: string) => {
    if (!d0Date) return {};

    // Parse a data no formato YYYY-MM-DD sem considerar timezone
    const parseDate = (
      dateStr: string,
    ): { year: number; month: number; day: number } => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return { year, month, day };
    };

    // Adiciona dias a uma data sem problemas de timezone
    const addDays = (dateStr: string, days: number): string => {
      const { year, month, day } = parseDate(dateStr);
      // Cria data local (sem timezone)
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + days);

      // Formata como YYYY-MM-DD usando métodos locais
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    return {
      d8_date: addDays(d0Date, 8),
      d10_date: addDays(d0Date, 10),
      d22_date: addDays(d0Date, 32),
      d30_date: addDays(d0Date, 40),
      d32_date: addDays(d0Date, 42),
      natural_mating_d35_entry: addDays(d0Date, 45),
      natural_mating_d80_exit: addDays(d0Date, 90),
      d110_date: addDays(d0Date, 120),
    };
  };

  const handleChange = (field: keyof ReproductionEvent, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate D-Series if D0 changes
      if (field === "d0_date" && value) {
        const dServices = calculateDServices(value);
        Object.assign(newData, dServices);
        // Default origin to d0 if not set
        if (!newData.pregnancy_origin) {
          newData.pregnancy_origin = "d0";
        }
      }

      // Recalculate Calving if origin or relevant dates change
      const relevantFields: (keyof ReproductionEvent)[] = [
        "pregnancy_origin",
        "d0_date",
        "natural_mating_d35_entry",
        "natural_mating_d80_exit",
      ];

      if (relevantFields.includes(field)) {
        if (newData.pregnancy_origin) {
          const calving = calculateCalvingDates(
            newData.pregnancy_origin,
            newData,
          );
          Object.assign(newData, calving);
        }
      }

      return newData;
    });
  };

  const handleTypeChange = (value: EventType) => {
    handleChange("event_type", value);
  };

  const cleanData = (data: Partial<ReproductionEvent>) => {
    const cleaned = { ...data };
    // Remove ghost properties for RxDB validation
    // @ts-ignore
    delete cleaned.d35_date;
    // @ts-ignore
    delete cleaned.d80_date;

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-primary font-black text-center text-lg uppercase tracking-tight mb-2">
        {isEdit
          ? "Editar Evento de Reprodução"
          : "Cadastrar Evento de Reprodução"}
      </h2>

      {/* Seção Principal */}
      <div className="space-y-4">
        <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
          Dados do Evento
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Tipo
            </label>
            <Select
              value={formData.event_type}
              onValueChange={(v) => handleTypeChange(v as EventType)}
            >
              <SelectTrigger className="bg-muted/40 border-0 h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IATF">IATF</SelectItem>
                <SelectItem value="FIV">FIV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Data D0 (Inseminação)
            </label>
            <Input
              type="date"
              value={formData.d0_date || ""}
              onChange={(e) => {
                handleChange("d0_date", e.target.value);
              }}
              className="bg-muted/40 border-0 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-1 w-full">
          <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
            Origem da Gestação (Base Parto)
          </label>
          <Select
            value={formData.pregnancy_origin || ""}
            onValueChange={(val) =>
              handleChange("pregnancy_origin", val as PregnancyOrigin)
            }
          >
            <SelectTrigger className="bg-muted/40 border-0 h-11 w-full text-sm">
              <SelectValue placeholder="Selecione a Base" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="d0">Inicial (D10)</SelectItem>
              <SelectItem value="resync">Resync (D32)</SelectItem>
              <SelectItem value="natural_mating">
                Repasse Natural (D35-D80)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground/80 italic px-1 leading-tight">
            Define qual data será usada para calcular a previsão de parto (+270
            a +305 dias).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 w-full">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Status Reprodutivo
            </label>
            <Select
              value={formData.productive_status || ""}
              onValueChange={(v) =>
                handleChange("productive_status", v as ReproductionStatus)
              }
            >
              <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parida">Parida</SelectItem>
                <SelectItem value="solteira">Solteira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Protocolo
            </label>
            <Select
              value={formData.protocol_name || ""}
              onValueChange={(v) => handleChange("protocol_name", v)}
            >
              <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                <SelectValue placeholder="Tipo de Protocolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Protocolo D10">Protocolo D10</SelectItem>
                <SelectItem value="Protocolo D11">Protocolo D11</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
            Touros
          </h3>
          <div className="space-y-4">
            <SemenDoseSelector
              label="Touro D0"
              value={formData.bull_name || ""}
              onValueChange={(name) => handleChange("bull_name", name)}
              placeholder="Selecione o Touro da IA"
            />

            <SemenDoseSelector
              label="Touro Resync (D22)"
              value={formData.resync_bull || ""}
              onValueChange={(name) => handleChange("resync_bull", name)}
              placeholder="Selecione o Touro de Repasse"
            />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Touro Monta Natural
              </label>
              <Input
                value={formData.natural_mating_bull || ""}
                onChange={(e) =>
                  handleChange("natural_mating_bull", e.target.value)
                }
                className="bg-muted/40 border-0 h-11"
                placeholder="Touro do Campo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção Avaliação Produtiva */}
      <div className="space-y-4">
        <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
          Avaliação Produtiva
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Data Avaliação
            </label>
            <Input
              type="date"
              value={formData.evaluation_date || ""}
              onChange={(e) => handleChange("evaluation_date", e.target.value)}
              className="bg-muted/40 border-0 h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Score Corporal
              </label>
              <Select
                value={formData.body_score?.toString() || ""}
                onValueChange={(v) =>
                  handleChange("body_score", parseInt(v) as 1 | 2 | 3 | 4 | 5)
                }
              >
                <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
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
            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Estágio do Ciclo
              </label>
              <Select
                value={formData.cycle_stage || ""}
                onValueChange={(v) =>
                  handleChange("cycle_stage", v as CycleStage)
                }
              >
                <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estro">Estro</SelectItem>
                  <SelectItem value="anestro 1">Anestro 1</SelectItem>
                  <SelectItem value="anestro 2">Anestro 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Tamanho Ovários
              </label>
              <Select
                value={formData.ovary_size || ""}
                onValueChange={(v) =>
                  handleChange("ovary_size", v as OvarySize)
                }
              >
                <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                Estrutura Ovários
              </label>
              <Select
                value={formData.ovary_structure || ""}
                onValueChange={(v) =>
                  handleChange("ovary_structure", v as OvaryStructure)
                }
              >
                <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Folículo">Folículo</SelectItem>
                  <SelectItem value="Corpo Lúteo">Corpo Lúteo</SelectItem>
                  <SelectItem value="Cisto">Cisto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Diagnóstico */}
      <div className="space-y-4">
        <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
          Diagnósticos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 w-full">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Diagnóstico D30
            </label>
            <Select
              value={formData.diagnostic_d30 || ""}
              onValueChange={(val) =>
                handleChange("diagnostic_d30", val as Diagnostic)
              }
            >
              <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                <SelectValue placeholder="Pendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prenha">Prenha</SelectItem>
                <SelectItem value="vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
              Diagnóstico Final (D110)
            </label>
            <Select
              value={formData.final_diagnostic || ""}
              onValueChange={(val) =>
                handleChange("final_diagnostic", val as Diagnostic)
              }
            >
              <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
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

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-11 font-bold uppercase text-xs tracking-wider"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 h-11 font-black uppercase text-xs tracking-wider shadow-md bg-primary hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Salvar Alterações" : "Cadastrar Evento"}
        </Button>
      </div>
    </form>
  );
}
