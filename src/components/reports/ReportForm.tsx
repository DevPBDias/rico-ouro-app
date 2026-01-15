"use client";

import React, { useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { GenderFilterValue } from "@/lib/pdf/definitions/types";
import { useReproductionEvents } from "@/hooks/db/reproduction_event/useReproductionEvents";
import { useStatuses } from "@/hooks/db/statuses/useStatuses";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ANIMAL_REPORT_AVAILABLE_COLUMNS,
  REPRODUCTION_REPORT_AVAILABLE_COLUMNS,
  MAX_SELECTABLE_COLUMNS,
} from "@/lib/pdf/definitions/availableColumns";
import { ReportCheckboxItem } from "@/components/relatorios/ReportCheckboxItem";
import { FarmFilterModal } from "./FarmFilterModal";
import { SexFilterModal } from "./SexFilterModal";
import { StatusFilterModal } from "./StatusFilterModal";
import { TableColumn } from "@/lib/pdf/types";

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

  // Hooks must be called unconditionally (before any early returns)
  const { farms } = useFarms();
  const { statuses } = useStatuses();
  const { events: allEvents } = useReproductionEvents();
  const { animals } = useAnimals();

  const [farmModalOpen, setFarmModalOpen] = React.useState(false);
  const [sexModalOpen, setSexModalOpen] = React.useState(false);
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);

  // Filter animals by selected farm (or all if no farm selected or filterMode is "all")
  const farmAnimals = useMemo(() => {
    if (!filters.farmId || filters.farmFilterMode === "all") {
      return animals;
    }
    return animals.filter((a) => a.farm_id === filters.farmId);
  }, [animals, filters.farmId, filters.farmFilterMode]);

  const farmAnimalRgns = useMemo(
    () => new Set(farmAnimals.map((a) => a.rgn)),
    [farmAnimals]
  );

  // Filter events by farm animals (or all if no farm selected or filterMode is "all")
  const farmEvents = useMemo(() => {
    if (!filters.farmId || filters.farmFilterMode === "all") {
      return allEvents;
    }
    return allEvents.filter((e) => farmAnimalRgns.has(e.rgn));
  }, [allEvents, farmAnimalRgns, filters.farmId, filters.farmFilterMode]);

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

  if (!selectedReport) return null;

  // Handle farm filter from modal
  const handleFarmFilterConfirm = (
    farmId: string | undefined,
    filterMode: "all" | "specific"
  ) => {
    const farm = farms.find((f) => f.id === farmId);
    updateFilters({
      farmId,
      farmName: farm?.farm_name || "",
      farmFilterMode: filterMode,
    });
  };

  // Handle sex filter from modal
  const handleSexFilterConfirm = (
    sex: GenderFilterValue | undefined,
    filterMode: "all" | "specific"
  ) => {
    updateFilters({
      sex: sex || "Ambos",
      sexFilterMode: filterMode,
    });
  };

  // Handle status filter from modal
  const handleStatusFilterConfirm = (
    status: string | undefined,
    filterMode: "all" | "specific"
  ) => {
    updateFilters({
      status: status || "Todos",
      statusFilterMode: filterMode,
    });
  };

  // Custom toggle for filter columns - opens modal instead
  const handleColumnToggle = (column: TableColumn) => {
    if (column.dataKey === "farmName") {
      // Se está desmarcando, remover filtro
      const isChecked =
        filters.selectedColumns?.some((c) => c.dataKey === "farmName") ?? false;
      if (isChecked) {
        updateFilters({
          farmId: undefined,
          farmName: undefined,
          farmFilterMode: undefined,
        });
        toggleColumn(column);
      } else {
        // Se está marcando, abrir modal
        setFarmModalOpen(true);
      }
    } else if (column.dataKey === "sex") {
      // Se está desmarcando, remover filtro
      const isChecked =
        filters.selectedColumns?.some((c) => c.dataKey === "sex") ?? false;
      if (isChecked) {
        updateFilters({
          sex: undefined,
          sexFilterMode: undefined,
        });
        toggleColumn(column);
      } else {
        // Se está marcando, abrir modal
        setSexModalOpen(true);
      }
    } else if (column.dataKey === "status") {
      // Se está desmarcando, remover filtro
      const isChecked =
        filters.selectedColumns?.some((c) => c.dataKey === "status") ?? false;
      if (isChecked) {
        updateFilters({
          status: undefined,
          statusFilterMode: undefined,
        });
        toggleColumn(column);
      } else {
        // Se está marcando, abrir modal
        setStatusModalOpen(true);
      }
    } else {
      toggleColumn(column);
    }
  };

  // Get validation error for a field
  const getError = (field: string): string | undefined => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  // Check if we've reached max columns
  // Filter columns (farmName, sex, status) don't count when filterMode is "specific"
  // because they don't appear in the report when filtering
  const isFarmColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "farmName") ?? false;
  const isSexColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "sex") ?? false;
  const isStatusColumnSelected =
    filters.selectedColumns?.some((c) => c.dataKey === "status") ?? false;

  const effectiveMaxColumns = MAX_SELECTABLE_COLUMNS; // Sempre 9 colunas

  // Count columns excluding filter columns when filterMode is "specific" (because they won't appear)
  const filterColumnsToExclude = [
    filters.farmFilterMode === "specific" && isFarmColumnSelected
      ? "farmName"
      : null,
    filters.sexFilterMode === "specific" && isSexColumnSelected ? "sex" : null,
    filters.statusFilterMode === "specific" && isStatusColumnSelected
      ? "status"
      : null,
  ].filter(Boolean) as string[];

  const columnCount =
    filterColumnsToExclude.length > 0
      ? filters.selectedColumns?.filter(
          (c) => !filterColumnsToExclude.includes(c.dataKey)
        ).length || 0
      : filters.selectedColumns?.length || 0;

  const maxColumnsReached = columnCount >= effectiveMaxColumns;

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
                {effectiveMaxColumns} colunas
                {filterColumnsToExclude.length > 0 && (
                  <span className="text-[9px]">
                    {" "}
                    (
                    {filterColumnsToExclude
                      .map((c) => {
                        const names: Record<string, string> = {
                          farmName: "FAZENDA",
                          sex: "SEXO",
                          status: "STATUS",
                        };
                        return names[c] || c;
                      })
                      .join(", ")}{" "}
                    não contam quando filtro específico está ativo)
                  </span>
                )}
                .
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                maxColumnsReached
                  ? "bg-amber-100 text-amber-700"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {columnCount} / {effectiveMaxColumns}
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

              // Filter columns (farmName, sex, status) are never disabled when filterMode is "specific"
              // because they don't count towards the limit
              const isFilterColumn = ["farmName", "sex", "status"].includes(
                column.dataKey
              );
              const isDisabled =
                !isFilterColumn && maxColumnsReached && !isChecked;

              return (
                <div key={column.dataKey} className="flex items-center">
                  <ReportCheckboxItem
                    id={column.dataKey}
                    label={column.header}
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={() => handleColumnToggle(column)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Modals */}
      <FarmFilterModal
        open={farmModalOpen}
        onOpenChange={setFarmModalOpen}
        farms={farms}
        currentFarmId={filters.farmId}
        currentFilterMode={filters.farmFilterMode || "all"}
        onConfirm={(farmId, filterMode) => {
          handleFarmFilterConfirm(farmId, filterMode);
          const isFarmColumnSelected =
            filters.selectedColumns?.some((c) => c.dataKey === "farmName") ??
            false;
          if (!isFarmColumnSelected) {
            toggleColumn({ header: "FAZENDA", dataKey: "farmName" });
          }
        }}
      />

      <SexFilterModal
        open={sexModalOpen}
        onOpenChange={setSexModalOpen}
        currentSex={filters.sex}
        currentFilterMode={filters.sexFilterMode || "all"}
        onConfirm={(sex, filterMode) => {
          handleSexFilterConfirm(sex, filterMode);
          const isSexColumnSelected =
            filters.selectedColumns?.some((c) => c.dataKey === "sex") ?? false;
          if (!isSexColumnSelected) {
            toggleColumn({ header: "SEXO", dataKey: "sex" });
          }
        }}
      />

      <StatusFilterModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        statuses={statuses}
        currentStatus={filters.status}
        currentFilterMode={filters.statusFilterMode || "all"}
        onConfirm={(status, filterMode) => {
          handleStatusFilterConfirm(status, filterMode);
          const isStatusColumnSelected =
            filters.selectedColumns?.some((c) => c.dataKey === "status") ??
            false;
          if (!isStatusColumnSelected) {
            toggleColumn({ header: "STATUS", dataKey: "status" });
          }
        }}
      />

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
