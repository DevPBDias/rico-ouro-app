"use client";

/**
 * ReportsPage Component
 *
 * Main page displaying all available reports as cards.
 * Uses the ReportsContext to manage state and the filter modal.
 */

import { useReports } from "@/context/ReportsContext";
import { AVAILABLE_REPORTS } from "@/lib/pdf/definitions";
import { ReportCard } from "./ReportCard";
import { ReportFilterModal } from "./ReportFilterModal";
import Header from "../layout/Header";

export function ReportsPage() {
  const { selectReport } = useReports();

  return (
    <div className="space-y-6">
      <Header title="Relatórios" />

      <div className="grid grid-cols-2 gap-4 px-4">
        {AVAILABLE_REPORTS.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onSelect={() => selectReport(report)}
          />
        ))}
      </div>

      <ReportFilterModal />
    </div>
  );
}
