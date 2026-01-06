import { Checkbox } from "@/components/ui/checkbox";

interface ReportCheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: () => void;
}

export function ReportCheckboxItem({
  id,
  label,
  checked,
  disabled,
  onCheckedChange,
}: ReportCheckboxItemProps) {
  return (
    <div
      className={`flex flex-row items-start justify-start gap-3 p-2 rounded-lg border-2 transition-all ${
        disabled
          ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:shadow-md " +
            (checked
              ? "bg-primary/5 border-primary shadow-sm"
              : "bg-gray-50 border-gray-200 hover:border-primary/30")
      }`}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="h-5 w-5 rounded border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
      />
      <label
        htmlFor={id}
        className={`text-sm font-medium flex-1 ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        } ${checked ? "text-primary" : "text-gray-700"}`}
      >
        {label}
      </label>
    </div>
  );
}


