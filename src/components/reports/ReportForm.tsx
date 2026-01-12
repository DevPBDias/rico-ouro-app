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
import { useMemo } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { GenderFilterValue, ReportFilters } from "@/lib/pdf/definitions/types";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ANIMAL_REPORT_AVAILABLE_COLUMNS,
  REPRODUCTION_REPORT_AVAILABLE_COLUMNS,
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

  // --- REPRODUCTION SPECIFIC LOGIC ---
  const { events: allEvents } = useReproductionEvents();
  const { animals } = useAnimals();

  // Filter animals by selected farm
  const farmAnimals = useMemo(() => {
    if (!filters.farmId) return [];
    return animals.filter((a) => a.farm_id === filters.farmId);
  }, [animals, filters.farmId]);

  const farmAnimalRgns = useMemo(
    () => new Set(farmAnimals.map((a) => a.rgn)),
    [farmAnimals]
  );

  // Filter events by farm animals
  const farmEvents = useMemo(() => {
    if (!filters.farmId) return [];
    return allEvents.filter((e) => farmAnimalRgns.has(e.rgn));
  }, [allEvents, farmAnimalRgns, filters.farmId]);

  // Available Years from Events of the current farm
  const availableYears = useMemo(
    () =>
      Array.from(
        new Set(
          farmEvents
            .filter((e) => e.d0_date)
            .map((e) => e.d0_date.split("-")[0])
        )
      ).sort((a, b) => b.localeCompare(a)),
    [farmEvents]
  );

  // Available Dates for the selected Year and Farm
  const availableDatesForYear = useMemo(
    () =>
      farmEvents
        .filter(
          (e) =>
            e.d0_date && (!filters.year || e.d0_date.startsWith(filters.year))
        )
        .map((e) => e.d0_date)
        .filter((value, index, self) => self.indexOf(value) === index) // Unique
        .sort((a, b) => b.localeCompare(a)),
    [farmEvents, filters.year]
  );

  const handleYearChange = (year: string) => {
    updateFilters({ year, managementDates: [] });
  };

  const toggleManagementDate = (date: string) => {
    const currentDates = filters.managementDates || [];
    if (currentDates.includes(date)) {
      updateFilters({
        managementDates: currentDates.filter((d) => d !== date),
      });
    } else {
      updateFilters({ managementDates: [...currentDates, date] });
    }
  };

  const handleSelectAllDates = () => {
    if (filters.managementDates?.length === availableDatesForYear.length) {
      updateFilters({ managementDates: [] });
    } else {
      updateFilters({ managementDates: availableDatesForYear });
    }
  };

  return (
    <div className="w-full border border-border rounded-xl p-6 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 bg-card">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-black text-primary uppercase tracking-tight">
          {selectedReport.title}
        </h2>
        <p className="text-xs text-muted-foreground italic">
          {selectedReport.description}
        </p>
      </div>

      <div className="space-y-4 w-full">
        <h3 className="font-bold text-[11px] uppercase text-muted-foreground border-b border-border/60 pb-1 mb-2">
          Filtros do Relatório
        </h3>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Farm Filter */}
          {requiresFilter("farm") && (
            <div className="space-y-1 flex-1">
              <Label
                htmlFor="farm"
                className="text-[10px] font-bold uppercase text-primary tracking-tight"
              >
                Fazenda <span className="text-red-500">*</span>
              </Label>
              <Select
                value={filters.farmId || ""}
                onValueChange={handleFarmChange}
              >
                <SelectTrigger
                  id="farm"
                  className={`w-full h-11 bg-muted/40 border-0 focus:ring-primary ${
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
            <div className="space-y-1 md:w-48">
              <Label
                htmlFor="sex"
                className="text-[10px] font-bold uppercase text-primary tracking-tight"
              >
                Sexo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={filters.sex || "Ambos"}
                onValueChange={(v) => handleSexChange(v as GenderFilterValue)}
              >
                <SelectTrigger
                  id="sex"
                  className="w-full h-11 bg-muted/40 border-0 focus:ring-primary"
                >
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-xl">
                  <SelectItem value="M" className="rounded-lg my-0.5">
                    Macho
                  </SelectItem>
                  <SelectItem value="F" className="rounded-lg my-0.5">
                    Fêmea
                  </SelectItem>
                  <SelectItem value="Ambos" className="rounded-lg my-0.5">
                    Todos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reproduction Year Filter */}
          {selectedReport.id === "reproduction" && (
            <div className="space-y-1 md:w-32">
              <Label
                htmlFor="year"
                className="text-[10px] font-bold uppercase text-primary tracking-tight"
              >
                Ano
              </Label>
              <Select
                value={filters.year || ""}
                onValueChange={handleYearChange}
              >
                <SelectTrigger
                  id="year"
                  className="w-full h-11 bg-muted/40 border-0 focus:ring-primary"
                >
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-xl">
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year} className="rounded-lg">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Reproduction Management Dates Checklist */}
        {selectedReport.id === "reproduction" &&
          filters.year &&
          availableDatesForYear.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-tight">
                  Datas de Manejo
                </Label>
              </div>

              <div className="bg-muted/30 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 border border-border/30 max-h-48 overflow-y-auto">
                {availableDatesForYear.map((date) => (
                  <div
                    key={date}
                    className="flex items-center space-x-2 bg-white/50 dark:bg-zinc-800/50 p-2 rounded-lg border border-border/40 transition-colors hover:border-primary/40"
                  >
                    <Checkbox
                      id={`date-${date}`}
                      checked={filters.managementDates?.includes(date)}
                      onCheckedChange={() => toggleManagementDate(date)}
                      className="rounded-md border-primary/40 text-primary focus-visible:ring-primary"
                    />
                    <Label
                      htmlFor={`date-${date}`}
                      className="text-[11px] font-bold text-muted-foreground cursor-pointer select-none"
                    >
                      {new Date(date).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}
                    </Label>
                  </div>
                ))}
              </div>
              {getError("managementDates") && (
                <p className="text-xs text-red-500 flex items-center gap-1.5 px-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {getError("managementDates")}
                </p>
              )}
            </div>
          )}
      </div>

      {/* Column Selection */}
      {selectedReport.allowColumnSelection && (
        <div className="space-y-4 pt-4 border-t border-border/40">
          <div className="flex justify-between items-end">
            <div>
              <Label className="text-[10px] font-bold uppercase text-primary tracking-tight">
                Colunas de Dados
              </Label>
              <p className="text-[10px] text-muted-foreground italic leading-tight">
                RGD / RGN é sempre incluída primeiro. Máximo de{" "}
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
            {(selectedReport.id === "reproduction"
              ? REPRODUCTION_REPORT_AVAILABLE_COLUMNS
              : ANIMAL_REPORT_AVAILABLE_COLUMNS
            ).map((column) => {
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

      <div className="pt-4 flex justify-end">
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="h-11 px-10 uppercase font-black text-xs tracking-wider shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando Relatório...
            </>
          ) : (
            "Gerar Relatório"
          )}
        </Button>
      </div>
    </div>
  );
}
