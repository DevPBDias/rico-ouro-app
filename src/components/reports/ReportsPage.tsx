"use client";

/**
 * ReportsPage Component
 *
 * Main page displaying all available reports in a tabbed layout.
 * Each tab contains a configuration form for the specific report.
 */

import { useReports } from "@/context/ReportsContext";
import { AVAILABLE_REPORTS } from "@/lib/pdf/definitions";
import { ReportForm } from "./ReportForm";
import Header from "../layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ReportsPage() {
  const { selectedReport, selectReport } = useReports();

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
          <TabsList className="flex flex-wrap justify-between items-start bg-muted/30 rounded-xl p-1 mb-1 h-auto gap-1 border border-border">
            {AVAILABLE_REPORTS.map((report) => (
              <TabsTrigger
                key={report.id}
                value={report.id}
                className="min-w-[82px] max-w-[96px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
              >
                {report.title.split(" ").pop()}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-2">
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

