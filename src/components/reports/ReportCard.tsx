"use client";

import { ReportDefinition } from "@/lib/pdf/definitions/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Beef,
  Syringe,
  Scale,
  Heart,
  FileText,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Beef,
  Syringe,
  Scale,
  Heart,
  FileText,
};

interface ReportCardProps {
  report: ReportDefinition;
  onSelect: () => void;
}

export function ReportCard({ report, onSelect }: ReportCardProps) {
  const IconComponent = iconMap[report.icon] || FileText;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group flex flex-col justify-between"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <IconComponent className="h-5 w-5" />
          </div>
          <CardTitle className="text-base">{report.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-4">
          {report.description}
        </CardDescription>
        <Button
          variant="default"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          Gerar Relatório
        </Button>
      </CardContent>
    </Card>
  );
}
