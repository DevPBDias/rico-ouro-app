import { ReportCheckboxItem } from "./ReportCheckboxItem";

export interface ReportOption {
  key: string;
  label: string;
}

interface ReportOptionsFormProps {
  options: ReportOption[];
  selectedItems: Record<string, boolean>;
  onCheckboxChange: (key: string) => void;
}

export function ReportOptionsForm({
  options,
  selectedItems,
  onCheckboxChange,
}: ReportOptionsFormProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
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
