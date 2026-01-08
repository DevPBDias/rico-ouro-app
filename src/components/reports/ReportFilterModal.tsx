"use client";

import { useReports } from "@/context/ReportsContext";
import { useFarms } from "@/hooks/db/farms/useFarms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function ReportFilterModal() {
  const {
    selectedReport,
    filters,
    isModalOpen,
    isGenerating,
    validationErrors,
    updateFilters,
    toggleColumn,
    generateReport,
    closeModal,
  } = useReports();

  const { farms } = useFarms();

  // Check if a filter type is required
  const requiresFilter = (filterType: string): boolean => {
    return selectedReport?.requiredFilters.includes(filterType as any) ?? false;
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

  if (!selectedReport) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedReport.title}</DialogTitle>
          <DialogDescription>{selectedReport.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Farm Filter */}
            {requiresFilter("farm") && (
              <div className="space-y-2 w-full">
                <Label htmlFor="farm">
                  Fazenda <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={filters.farmId || ""}
                  onValueChange={handleFarmChange}
                >
                  <SelectTrigger
                    id="farm"
                    className={`w-full ${
                      getError("farm") ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Selecione uma fazenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.farm_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getError("farm") && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {getError("farm")}
                  </p>
                )}
              </div>
            )}

            {/* Sex Filter */}
            {requiresFilter("sex") && (
              <div className="space-y-2">
                <Label htmlFor="sex">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={filters.sex || "Ambos"}
                  onValueChange={(v) => handleSexChange(v as GenderFilterValue)}
                >
                  <SelectTrigger id="sex" className="w-full">
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Machos</SelectItem>
                    <SelectItem value="F">Fêmeas</SelectItem>
                    <SelectItem value="Ambos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          {requiresFilter("dateRange") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Data Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  className={getError("dateRange") ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Data Final <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  className={getError("dateRange") ? "border-red-500" : ""}
                />
              </div>
              {getError("dateRange") && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {getError("dateRange")}
                </p>
              )}
            </div>
          )}

          {/* Column Selection */}
          {selectedReport.allowColumnSelection && (
            <div className="space-y-2">
              <Label>
                Colunas{" "}
                <span className="text-muted-foreground text-sm">
                  (máx. {MAX_SELECTABLE_COLUMNS})
                </span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                A coluna "RGD / RGN" é sempre incluída como primeira coluna.
              </p>
              <div className="border rounded-lg p-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
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
              {maxColumnsReached && (
                <p className="text-xs text-amber-600">
                  Máximo de {MAX_SELECTABLE_COLUMNS} colunas atingido.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar PDF"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
