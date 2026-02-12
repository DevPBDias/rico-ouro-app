"use client";

import { useReports } from "@/context/ReportsContext";
import { AVAILABLE_REPORTS } from "@/lib/pdf/definitions";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import { ReportForm } from "@/components/reports";
import { StandardTabList } from "@/components/ui/StandardTabList";
import { useEffect } from "react";
import {
  HouseIcon,
  Syringe,
  RulerDimensionLine,
  VenusAndMars,
  FlaskConical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Map icon strings from report definitions to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Beef: HouseIcon,
  Syringe,
  Scale: RulerDimensionLine,
  Heart: VenusAndMars,
  FlaskConical,
};

export default function ReportsPage() {
  const { selectedReport, selectReport } = useReports();

  // Ensure a report is selected on mount
  useEffect(() => {
    if (AVAILABLE_REPORTS.length > 0) {
      if (
        !selectedReport ||
        !AVAILABLE_REPORTS.find((r) => r.id === selectedReport.id)
      ) {
        selectReport(AVAILABLE_REPORTS[0]);
      }
    }
  }, [selectedReport, selectReport]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header title="Relatórios" />

      <div className="py-4 px-2 space-y-4">
        <Tabs
          defaultValue={AVAILABLE_REPORTS[0].id}
          value={selectedReport?.id}
          onValueChange={(id) => {
            const report = AVAILABLE_REPORTS.find((r) => r.id === id);
            if (report) selectReport(report);
          }}
          className="w-full"
        >
          <StandardTabList
            tabs={AVAILABLE_REPORTS.map((report) => ({
              value: report.id,
              label: report.title.split(" ").pop() || report.title,
              icon: iconMap[report.icon],
            }))}
            activeTab={selectedReport?.id || ""}
            onTabChange={(id) => {
              const report = AVAILABLE_REPORTS.find((r) => r.id === id);
              if (report) selectReport(report);
            }}
          />

          <div className="mt-4">
            {AVAILABLE_REPORTS.map((report) => (
              <TabsContent
                key={report.id}
                value={report.id}
                className="mt-0 ring-offset-background focus-visible:outline-none"
              >
                <ReportForm />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
