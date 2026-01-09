"use client";

import { useReports } from "@/context/ReportsContext";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { GenderFilterValue } from "@/lib/pdf/definitions/types";
import {
  ANIMAL_REPORT_AVAILABLE_COLUMNS,
  MAX_SELECTABLE_COLUMNS,
} from "@/lib/pdf/definitions/availableColumns";
import { ReportCheckboxItem } from "@/components/relatorios/ReportCheckboxItem";

export function ReportForm() {
  const {
    selectedReport,
    filters,
    isGenerating,
    validationErrors,
    updateFilters,
    toggleColumn,
    generateReport,
  } = useReports();

  const { farms } = useFarms();

  if (!selectedReport) return null;

  // Check if a filter type is required
  const requiresFilter = (filterType: string): boolean => {
    return selectedReport.requiredFilters.includes(filterType as any);
  };

  // Get validation error for a field
  const getError = (field: string): string | undefined => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  // Handle farm selection
  const handleFarmChange = (farmId: string) => {
    const farm = farms.find((f) => f.id === farmId);
    updateFilters({
      farmId: farmId,
      farmName: farm?.farm_name || "",
    });
  };

  // Handle sex selection
  const handleSexChange = (sex: GenderFilterValue) => {
    updateFilters({ sex });
  };

  // Handle date changes
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    updateFilters({ [field]: value });
  };

  // Check if we've reached max columns
  const maxColumnsReached =
    (filters.selectedColumns?.length || 0) >= MAX_SELECTABLE_COLUMNS;

  return (
    <div className="w-full border border-border rounded-xl p-4 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-primary">
          {selectedReport.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedReport.description}
        </p>
      </div>

      <div className="space-y-2 w-full ">
        <div className="flex flex-row justify-between items-center gap-4 w-full ">
          {/* Farm Filter */}
          {requiresFilter("farm") && (
            <div
              className={`space-y-2 ${
                requiresFilter("dateRange") || !requiresFilter("sex")
                  ? "col-span-2"
                  : "col-span-1"
              }`}
            >
              <Label
                htmlFor="farm"
                className="text-xs font-bold uppercase text-foreground/70"
              >
                Fazenda <span className="text-red-500">*</span>
              </Label>
              <Select
                value={filters.farmId || ""}
                onValueChange={handleFarmChange}
              >
                <SelectTrigger
                  id="farm"
                  className={`w-full h-12 rounded-xl bg-muted/30 border-border/50 focus:ring-primary ${
                    getError("farm") ? "border-red-500 bg-red-50/10" : ""
                  }`}
                >
                  <SelectValue placeholder="Selecione uma fazenda" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-xl">
                  {farms.map((farm) => (
                    <SelectItem
                      key={farm.id}
                      value={farm.id}
                      className="rounded-lg my-0.5"
                    >
                      {farm.farm_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("farm") && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 px-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {getError("farm")}
                </p>
              )}
            </div>
          )}

          {/* Sex Filter */}
          {requiresFilter("sex") && (
            <div className="space-y-2 w-full">
              <Label
                htmlFor="sex"
                className="text-xs font-bold uppercase text-foreground/70"
              >
                Sexo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={filters.sex || "Ambos"}
                onValueChange={(v) => handleSexChange(v as GenderFilterValue)}
              >
                <SelectTrigger
                  id="sex"
                  className="w-full h-12 rounded-xl bg-muted/30 border-border/50 focus:ring-primary"
                >
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-xl">
                  <SelectItem value="M" className="rounded-lg my-0.5">
                    Machos
                  </SelectItem>
                  <SelectItem value="F" className="rounded-lg my-0.5">
                    Fêmeas
                  </SelectItem>
                  <SelectItem value="Ambos" className="rounded-lg my-0.5">
                    Todos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {/* Date Range Filter */}
        {requiresFilter("dateRange") && (
          <>
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-xs font-bold uppercase text-foreground/70"
              >
                Data Inicial <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className={`h-12 rounded-xl bg-muted/30 border-border/50 focus:ring-primary ${
                  getError("dateRange") ? "border-red-500 bg-red-50/10" : ""
                }`}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-xs font-bold uppercase text-foreground/70"
              >
                Data Final <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className={`h-12 rounded-xl bg-muted/30 border-border/50 focus:ring-primary ${
                  getError("dateRange") ? "border-red-500 bg-red-50/10" : ""
                }`}
              />
              {getError("dateRange") && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 px-1 pt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {getError("dateRange")}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Column Selection */}
      {selectedReport.allowColumnSelection && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex justify-between items-end">
            <div>
              <Label className="text-xs font-bold uppercase text-foreground/70">
                Colunas de Dados
              </Label>
              <p className="text-[11px] text-muted-foreground italic">
                RGD / RGN é sempre incluída primeiro. Max{" "}
                {MAX_SELECTABLE_COLUMNS} colunas.
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                maxColumnsReached
                  ? "bg-amber-100 text-amber-700"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {filters.selectedColumns?.length || 0} / {MAX_SELECTABLE_COLUMNS}
            </span>
          </div>

          <div className="bg-muted/30 rounded-xl px-1.5 py-2 grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-1 border border-border/30">
            {ANIMAL_REPORT_AVAILABLE_COLUMNS.map((column) => {
              const isChecked =
                filters.selectedColumns?.some(
                  (c) => c.dataKey === column.dataKey
                ) ?? false;
              const isDisabled = maxColumnsReached && !isChecked;

              return (
                <div key={column.dataKey} className="flex items-center">
                  <ReportCheckboxItem
                    id={column.dataKey}
                    label={column.header}
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando Relatório...
            </>
          ) : (
            "Gerar PDF do Relatório"
          )}
        </Button>
      </div>
    </div>
  );
}
