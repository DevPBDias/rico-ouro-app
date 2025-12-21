import { Checkbox } from "@/components/ui/checkbox";

interface ReportCheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}

export function ReportCheckboxItem({
  id,
  label,
  checked,
  onCheckedChange,
}: ReportCheckboxItemProps) {
  return (
    <div
      className={`flex flex-row items-start justify-start gap-3 p-2 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
        checked
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-gray-50 border-gray-200 hover:border-primary/30"
      }`}
      onClick={onCheckedChange}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-5 w-5 rounded border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
      />
      <label
        htmlFor={id}
        className={`text-sm font-medium cursor-pointer flex-1 ${
          checked ? "text-primary" : "text-gray-700"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
