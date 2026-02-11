"use client";

import { useReports } from "@/context/ReportsContext";
import { AVAILABLE_REPORTS } from "@/lib/pdf/definitions";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import { ReportForm } from "@/components/reports";
import { StandardTabList } from "@/components/ui/StandardTabList";
import { useState, useMemo, useEffect } from "react";
import { Syringe, Scale, Heart, FlaskConical, HouseIcon } from "lucide-react";

type MainTab = "vendas" | "clientes";

// Map icon strings from definitions to Lucide components
const iconMap: Record<string, any> = {
  HouseIcon,
  Syringe,
  Scale,
  Heart,
  FlaskConical,
};

export default function ReportsPage() {
  const { selectedReport, selectReport } = useReports();
  const [mainTab, setMainTab] = useState<MainTab>("clientes");

  // Filter reports based on the selected main category
  const filteredReports = useMemo(() => {
    if (mainTab === "clientes") {
      return AVAILABLE_REPORTS;
    }
    return [];
  }, [mainTab]);

  // Ensure a report is selected when the category changes
  useEffect(() => {
    if (filteredReports.length > 0) {
      if (
        !selectedReport ||
        !filteredReports.find((r) => r.id === selectedReport.id)
      ) {
        selectReport(filteredReports[0]);
      }
    }
  }, [filteredReports, selectedReport, selectReport]);

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
          {filteredReports.length > 0 ? (
            <StandardTabList
              tabs={filteredReports.map((report) => ({
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
          ) : (
            <div className="py-10 text-center text-muted-foreground text-sm bg-muted/20 rounded-xl border border-dashed mb-4">
              Nenhum relatório disponível para esta categoria.
            </div>
          )}

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
