import { ReportCheckboxItem } from "./ReportCheckboxItem";
import { SelectedReportFields } from "@/utils/exportToPdf";

export interface ReportOption {
  key: keyof SelectedReportFields;
  label: string;
}

interface ReportOptionsFormProps {
  options: ReportOption[];
  selectedItems: SelectedReportFields;
  onCheckboxChange: (key: keyof SelectedReportFields) => void;
}

export function ReportOptionsForm({
  options,
  selectedItems,
  onCheckboxChange,
}: ReportOptionsFormProps) {
  return (
    <div className="space-y-3 grid grid-cols-2 gap-2">
      {options.map((option) => (
        <ReportCheckboxItem
          key={option.key}
          id={option.key}
          label={option.label}
          checked={selectedItems[option.key] || false}
          onCheckedChange={() => onCheckboxChange(option.key)}
        />
      ))}
    </div>
  );
}
