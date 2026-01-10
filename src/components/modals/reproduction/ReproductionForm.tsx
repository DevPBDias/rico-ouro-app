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
  PregnancyOrigin,
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

  const calculateCalvingDates = (
    origin: PregnancyOrigin,
    dates: Partial<ReproductionEvent>
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

    const startDate = new Date(startBase);
    const endDate = new Date(endBase);

    const date270 = new Date(startDate);
    date270.setDate(date270.getDate() + 270);

    // Natural mating uses +270 for both ends (as per user requested range)
    // Other protocols use +305 for the end date (standard window)
    const dateEnd = new Date(endDate);
    if (origin === "natural_mating") {
      dateEnd.setDate(dateEnd.getDate() + 270);
    } else {
      dateEnd.setDate(dateEnd.getDate() + 305);
    }

    return {
      calving_start_date: date270.toISOString().split("T")[0],
      calving_end_date: dateEnd.toISOString().split("T")[0],
    };
  };

  const calculateDServices = (d0Date: string) => {
    if (!d0Date) return {};
    const base = new Date(d0Date);

    const addDays = (days: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0];
    };

    return {
      d8_date: addDays(8),
      d10_date: addDays(10),
      d22_date: addDays(22),
      d30_date: addDays(30),
      d32_date: addDays(32),
      natural_mating_d35_entry: addDays(35),
      natural_mating_d80_exit: addDays(80),
      d110_date: addDays(110),
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
            newData
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seção Principal */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Dados do Evento
        </h3>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-1 w-full pt-2">
          <label className="text-xs font-bold text-primary uppercase">
            Origem da Gestação (Base Parto)
          </label>
          <Select
            value={formData.pregnancy_origin || ""}
            onValueChange={(val) =>
              handleChange("pregnancy_origin", val as PregnancyOrigin)
            }
          >
            <SelectTrigger className="bg-muted border-0 h-10 w-full">
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
          <p className="text-[10px] text-muted-foreground italic px-1">
            Define qual data será usada para calcular a previsão de parto (+270
            a +305 dias).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 w-full">
            <label className="text-xs font-bold text-primary uppercase">
              Status Reprodutivo
            </label>
            <Select
              value={formData.productive_status || ""}
              onValueChange={(v) =>
                handleChange("productive_status", v as ReproductionStatus)
              }
            >
              <SelectTrigger className="bg-muted border-0 w-full">
                <SelectValue placeholder="(Parida/Solteira)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parida">Parida</SelectItem>
                <SelectItem value="solteira">Solteira</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <label className="text-xs font-bold text-primary uppercase">
              Protocolo
            </label>
            <Select
              value={formData.protocol_name || ""}
              onValueChange={(v) =>
                handleChange("protocol_name", v as ReproductionStatus)
              }
            >
              <SelectTrigger className="bg-muted border-0 w-full">
                <SelectValue placeholder="Tipo de Protocolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parida">Protocolo D10</SelectItem>
                <SelectItem value="solteira">Protocolo D11</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
            Touros
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Touro D0
            </label>
            <Input
              value={formData.bull_name || ""}
              onChange={(e) => handleChange("bull_name", e.target.value)}
              className="bg-muted border-0"
              placeholder="Nome do Touro"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Touro Resync (D22)
            </label>
            <Input
              value={formData.resync_bull || ""}
              onChange={(e) => handleChange("resync_bull", e.target.value)}
              className="bg-muted border-0"
              placeholder="Nome do Touro de Repasse"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Touro Monta Natural
            </label>
            <Input
              value={formData.natural_mating_bull || ""}
              onChange={(e) =>
                handleChange("natural_mating_bull", e.target.value)
              }
              className="bg-muted border-0"
              placeholder="Touro do Campo"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Entrada Campo (D35)
            </label>
            <Input
              type="date"
              value={formData.natural_mating_d35_entry || ""}
              onChange={(e) =>
                handleChange("natural_mating_d35_entry", e.target.value)
              }
              className="bg-muted border-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase">
              Saída Campo (D80)
            </label>
            <Input
              type="date"
              value={formData.natural_mating_d80_exit || ""}
              onChange={(e) =>
                handleChange("natural_mating_d80_exit", e.target.value)
              }
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 w-full">
              <label className="text-xs font-bold text-primary uppercase">
                Score Corporal
              </label>
              <Select
                value={formData.body_score?.toString() || ""}
                onValueChange={(v) =>
                  handleChange("body_score", parseInt(v) as 1 | 2 | 3 | 4 | 5)
                }
              >
                <SelectTrigger className="bg-muted border-0 w-2/3">
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
              <label className="text-xs font-bold text-primary uppercase">
                Estágio do Ciclo
              </label>
              <Select
                value={formData.cycle_stage || ""}
                onValueChange={(v) =>
                  handleChange("cycle_stage", v as CycleStage)
                }
              >
                <SelectTrigger className="bg-muted border-0 w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="space-y-1 w-full">
              <label className="text-xs font-bold text-primary uppercase">
                Tamanho Ovários
              </label>
              <Select
                value={formData.ovary_size || ""}
                onValueChange={(v) =>
                  handleChange("ovary_size", v as OvarySize)
                }
              >
                <SelectTrigger className="bg-muted border-0 w-3/4">
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
              <label className="text-xs font-bold text-primary uppercase">
                Estrutura Ovários
              </label>
              <Select
                value={formData.ovary_structure || ""}
                onValueChange={(v) =>
                  handleChange("ovary_structure", v as OvaryStructure)
                }
              >
                <SelectTrigger className="bg-muted border-0 w-3/4">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foliculo">Folículo</SelectItem>
                  <SelectItem value="corpo_luteo">Corpo Lúteo</SelectItem>
                  <SelectItem value="cisto">Cisto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Diagnóstico */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm uppercase text-gray-500 border-b pb-1">
          Diagnósticos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 w-full">
            <label className="text-xs font-bold text-primary uppercase">
              Diagnóstico D30
            </label>
            <Select
              value={formData.diagnostic_d30 || ""}
              onValueChange={(val) =>
                handleChange("diagnostic_d30", val as Diagnostic)
              }
            >
              <SelectTrigger className="bg-muted border-0 h-10 w-full">
                <SelectValue placeholder="Pendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prenha">Prenha</SelectItem>
                <SelectItem value="vazia">Vazia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <label className="text-xs font-bold text-primary uppercase">
              Diagnóstico Final (D110)
            </label>
            <Select
              value={formData.final_diagnostic || ""}
              onValueChange={(val) =>
                handleChange("final_diagnostic", val as Diagnostic)
              }
            >
              <SelectTrigger className="bg-muted border-0 h-10 w-full">
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

