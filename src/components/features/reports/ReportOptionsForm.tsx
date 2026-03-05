import { ReportCheckboxItem } from "./ReportCheckboxItem";

export interface ReportOption {
  key: string;
  label: string;
}

interface ReportOptionsFormProps {
  options: ReportOption[];
  selectedItems: Record<string, boolean>;
  onCheckboxChange: (key: string) => void;
  maxReached?: boolean;
}

export function ReportOptionsForm({
  options,
  selectedItems,
  onCheckboxChange,
  maxReached = false,
}: ReportOptionsFormProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((option) => {
        const isChecked = selectedItems[option.key] || false;
        return (
          <ReportCheckboxItem
            key={option.key}
            id={option.key}
            label={option.label}
            checked={isChecked}
            disabled={maxReached && !isChecked}
            onCheckedChange={() => onCheckboxChange(option.key)}
          />
        );
      })}
    </div>
  );
}

