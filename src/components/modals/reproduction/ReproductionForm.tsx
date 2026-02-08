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
import {
  Loader2,
  Calendar,
  Activity,
  ClipboardList,
  Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { StandardTabList } from "@/components/ui/StandardTabList";
import { SemenDoseSelector } from "@/components/doses/SemenDoseSelector";
import { formatDate } from "@/utils/formatDates";
import { DateOnly } from "@/utils/date_only";

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

  const [activeFormTab, setActiveFormTab] = useState("evento");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const calculateCalvingDates = (
    origin: PregnancyOrigin,
    dates: Partial<ReproductionEvent>,
  ) => {
    let startBase: DateOnly | undefined;
    let endBase: DateOnly | undefined;

    switch (origin) {
      case "d10":
        if (dates.d10_date) {
          startBase = DateOnly.fromISO(dates.d10_date);
          endBase = startBase;
        }
        break;

      case "resync":
        if (dates.d32_date) {
          startBase = DateOnly.fromISO(dates.d32_date);
          endBase = startBase;
        }
        break;

      case "natural_mating":
        if (dates.natural_mating_d35_entry && dates.natural_mating_d80_exit) {
          startBase = DateOnly.fromISO(dates.natural_mating_d35_entry);
          endBase = DateOnly.fromISO(dates.natural_mating_d80_exit);
        }
        break;
    }

    if (!startBase || !endBase) return {};

    const calvingStart = startBase.addDays(280);

    const calvingEnd =
      origin === "natural_mating" ? endBase.addDays(280) : endBase.addDays(315);

    return {
      calving_start_date: calvingStart.toISO(),
      calving_end_date: calvingEnd.toISO(),
    };
  };

  const calculateDServices = (
    d0Date: string,
    protocolName: string = "Sync D10",
  ) => {
    if (!d0Date) return {};

    const d0 = DateOnly.fromISO(d0Date);
    const isD11 = protocolName === "Sync D11";

    return {
      d8_date: d0.addDays(isD11 ? 9 : 8).toISO(),
      d10_date: d0.addDays(isD11 ? 11 : 10).toISO(),
      d22_date: d0.addDays(isD11 ? 34 : 32).toISO(),
      d30_date: d0.addDays(isD11 ? 42 : 40).toISO(),
      d32_date: d0.addDays(isD11 ? 44 : 42).toISO(),
      natural_mating_d35_entry: d0.addDays(isD11 ? 47 : 45).toISO(),
      natural_mating_d80_exit: d0.addDays(isD11 ? 92 : 90).toISO(),
      d110_date: d0.addDays(120).toISO(),
    };
  };

  const handleChange = (field: keyof ReproductionEvent, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate D-Series if D0 changes or Protocol changes
      if ((field === "d0_date" && value) || field === "protocol_name") {
        // Use current D0 if protocol changed, or new D0 if D0 changed
        const d0 = field === "d0_date" ? value : prev.d0_date;
        const protocol = field === "protocol_name" ? value : prev.protocol_name;

        if (d0) {
          const dServices = calculateDServices(d0, protocol);
          Object.assign(newData, dServices);
        }

        // Default origin to d0 if not set
        if (!newData.pregnancy_origin) {
          newData.pregnancy_origin = "d10";
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
      <Tabs
        value={activeFormTab}
        onValueChange={setActiveFormTab}
        className="w-full"
      >
        <StandardTabList
          tabs={[
            { value: "evento", label: "Evento", icon: Calendar },
            { value: "avaliacao", label: "Avaliação", icon: Activity },
            { value: "resultados", label: "Resultados", icon: Target },
          ]}
          activeTab={activeFormTab}
          onTabChange={setActiveFormTab}
          className="mb-6"
        />

        <TabsContent value="evento" className="space-y-4">
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
                  Data D0
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 w-full">
                <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Protocolo IATF
                </label>
                <Select
                  value={formData.protocol_name || ""}
                  onValueChange={(v) => handleChange("protocol_name", v)}
                >
                  <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                    <SelectValue placeholder="Tipo de Protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sync D10">Sync D10</SelectItem>
                    <SelectItem value="Sync D11">Sync D11</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-start gap-2 w-full border border-primary/60 p-2 rounded-md">
                <p className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center justify-center gap-2">
                  {formData.protocol_name === "Sync D11"
                    ? "Data D9"
                    : "Data D8"}{" "}
                  <span className="text-black text-center text-sm font-normal">
                    {formatDate(formData.d8_date)}
                  </span>
                </p>
                <p className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center justify-center gap-2 ">
                  {formData.protocol_name === "Sync D11"
                    ? "Data D11"
                    : "Data D10"}{" "}
                  <span className="text-black text-center text-sm font-normal">
                    {formatDate(formData.d10_date)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="avaliacao" className="space-y-4">
          {/* Seção Avaliação Reprodutiva */}
          <div className="space-y-4">
            <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
              Avaliação Reprodutiva
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Data Avaliação
                </label>
                <Input
                  type="date"
                  value={formData.evaluation_date || ""}
                  onChange={(e) =>
                    handleChange("evaluation_date", e.target.value)
                  }
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
                      handleChange(
                        "body_score",
                        parseInt(v) as 1 | 2 | 3 | 4 | 5,
                      )
                    }
                  >
                    <TabsTrigger asChild value="avaliacao">
                      <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </TabsTrigger>
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
                    Estágio do Ciclo Estral
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
                      <SelectItem value="proestro">Proestro</SelectItem>
                      <SelectItem value="estro">Estro</SelectItem>
                      <SelectItem value="metaestro">Metaestro (Cio)</SelectItem>
                      <SelectItem value="diestro">Diestro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 w-full">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                    Tamanho dos Ovários
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
                    Estrutura dos Ovários
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resultados" className="space-y-4">
          {/* Seção Diagnóstico */}
          <div className="space-y-4">
            <div className="pt-2">
              <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
                Touro{" "}
                {formData.protocol_name === "Sync D11"
                  ? "Sync D11"
                  : "Sync D10"}{" "}
                - {formatDate(formData.d10_date)}
              </h3>
              <div className="space-y-4">
                <SemenDoseSelector
                  value={formData.bull_name || ""}
                  onValueChange={(name) => handleChange("bull_name", name)}
                  placeholder="Selecione o Touro da IA"
                />
                <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
                  Resync / diaganostico gestacional
                </h3>

                <div className="space-y-1 w-full flex flex-row justify-between">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                      Diagnóstico GestaCIONAL (
                      {formData.protocol_name === "Sync D11" ? "D32" : "D30"}) -{" "}
                      {formatDate(formData.d30_date)}
                    </label>
                    <Select
                      value={formData.diagnostic_d30 || ""}
                      onValueChange={(v) =>
                        handleChange("diagnostic_d30", v as Diagnostic)
                      }
                    >
                      <SelectTrigger className="bg-muted/40 border-0 h-11 w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vazia">Vazia</SelectItem>
                        <SelectItem value="prenha">Prenha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-tight p-2 rounded-md flex flex-col items-start gap-2">
                    Data Resync{" "}
                    {formData.protocol_name === "Sync D11" ? "D23" : "D22"}{" "}
                    <span className="text-primary text-center text-sm">
                      {formatDate(formData.d22_date)}
                    </span>
                  </p>
                </div>

                {formData.diagnostic_d30 === "vazia" && (
                  <div className="space-y-1">
                    <div className="flex justify-between w-full">
                      <p className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-2 border border-primary/60 p-2 rounded-md">
                        Data Resync{" "}
                        {formData.protocol_name === "Sync D11" ? "D32" : "D30"}{" "}
                        <span className="text-primary text-center text-sm">
                          {formatDate(formData.d30_date)}
                        </span>
                      </p>
                      <p className="w-fit text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-2 border border-primary/60 p-2 rounded-md">
                        Data resync{" "}
                        {formData.protocol_name === "Sync D11"
                          ? "IA D34"
                          : "IA D32"}{" "}
                        <span className="text-primary text-center text-sm">
                          {formatDate(formData.d32_date)}
                        </span>
                      </p>
                    </div>
                    <SemenDoseSelector
                      label="Touro Resync"
                      value={formData.resync_bull || ""}
                      onValueChange={(name) =>
                        handleChange("resync_bull", name)
                      }
                      placeholder="Selecione o Touro"
                    />
                  </div>
                )}

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
                    placeholder="Selecione o Touro"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-4">
              Diagnóstico / Previsão de Parto
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1 w-full">
                <label className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  Previsão de Parto a Partir De
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
                    <SelectItem value="d10">
                      {formData.protocol_name === "Sync D11"
                        ? "Sync D11"
                        : "Sync D10"}
                    </SelectItem>
                    <SelectItem value="resync">
                      {formData.protocol_name === "Sync D11"
                        ? "Resync D34"
                        : "Resync D32"}
                    </SelectItem>
                    <SelectItem value="natural_mating">
                      {formData.protocol_name === "Sync D11"
                        ? "Monta Natural D37-D82"
                        : "Monta Natural D35-D80"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
