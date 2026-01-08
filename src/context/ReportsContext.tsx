"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  ReportDefinition,
  ReportFilters,
  FilterValidationError,
  validateRequiredFilters,
  GenderFilterValue,
} from "@/lib/pdf/definitions/types";
import { TableColumn } from "@/lib/pdf/types";

interface ReportsContextState {
  selectedReport: ReportDefinition | null;
  filters: ReportFilters;
  isGenerating: boolean;
  validationErrors: FilterValidationError[];
  isModalOpen: boolean;
}

interface ReportsContextActions {
  selectReport: (report: ReportDefinition) => void;
  updateFilter: <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) => void;
  updateFilters: (updates: Partial<ReportFilters>) => void;
  toggleColumn: (column: TableColumn) => void;
  validateFilters: () => boolean;
  generateReport: () => Promise<boolean>;
  reset: () => void;
  closeModal: () => void;
}

type ReportsContextType = ReportsContextState & ReportsContextActions;

const initialFilters: ReportFilters = {
  farmId: undefined,
  farmName: undefined,
  sex: "Ambos" as GenderFilterValue,
  startDate: undefined,
  endDate: undefined,
  selectedColumns: [],
};

const initialState: ReportsContextState = {
  selectedReport: null,
  filters: initialFilters,
  isGenerating: false,
  validationErrors: [],
  isModalOpen: false,
};

const ReportsContext = createContext<ReportsContextType | null>(null);

export function useReports(): ReportsContextType {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}

interface ReportsProviderProps {
  children: React.ReactNode;
}

export function ReportsProvider({ children }: ReportsProviderProps) {
  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(
    null
  );
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    FilterValidationError[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectReport = useCallback((report: ReportDefinition) => {
    setSelectedReport(report);
    setFilters(initialFilters); // Reset filters when selecting new report
    setValidationErrors([]);
    setIsModalOpen(true);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      // Clear validation errors when user changes a filter
      setValidationErrors([]);
    },
    []
  );

  const updateFilters = useCallback((updates: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setValidationErrors([]);
  }, []);

  const toggleColumn = useCallback((column: TableColumn) => {
    setFilters((prev) => {
      const currentColumns = prev.selectedColumns || [];
      const exists = currentColumns.some((c) => c.dataKey === column.dataKey);

      if (exists) {
        // Remove column
        return {
          ...prev,
          selectedColumns: currentColumns.filter(
            (c) => c.dataKey !== column.dataKey
          ),
        };
      } else {
        // Add column
        return {
          ...prev,
          selectedColumns: [...currentColumns, column],
        };
      }
    });
    setValidationErrors([]);
  }, []);

  const validateFilters = useCallback((): boolean => {
    if (!selectedReport) return false;

    const errors = validateRequiredFilters(selectedReport, filters);
    setValidationErrors(errors);

    return errors.length === 0;
  }, [selectedReport, filters]);

  const generateReport = useCallback(async (): Promise<boolean> => {
    if (!selectedReport) return false;

    // Validate first
    const isValid = validateFilters();
    if (!isValid) return false;

    try {
      setIsGenerating(true);

      // Call the report's generate function with filters
      await selectedReport.generate({ filters });

      // Close modal on success
      setIsModalOpen(false);

      return true;
    } catch (error) {
      console.error("[ReportsContext] Error generating report:", error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [selectedReport, filters, validateFilters]);

  const reset = useCallback(() => {
    setSelectedReport(null);
    setFilters(initialFilters);
    setValidationErrors([]);
    setIsGenerating(false);
    setIsModalOpen(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setValidationErrors([]);
  }, []);

  const value = useMemo<ReportsContextType>(
    () => ({
      selectedReport,
      filters,
      isGenerating,
      validationErrors,
      isModalOpen,
      selectReport,
      updateFilter,
      updateFilters,
      toggleColumn,
      validateFilters,
      generateReport,
      reset,
      closeModal,
    }),
    [
      selectedReport,
      filters,
      isGenerating,
      validationErrors,
      isModalOpen,
      selectReport,
      updateFilter,
      updateFilters,
      toggleColumn,
      validateFilters,
      generateReport,
      reset,
      closeModal,
    ]
  );

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}
