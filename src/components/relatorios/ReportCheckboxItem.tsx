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
    <div className="flex items-center justify-between bg-[#F5F5F5] rounded-lg p-4">
      <label
        htmlFor={id}
        className="text-base text-gray-900 cursor-pointer flex-1"
      >
        {label}
      </label>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-6 w-6 rounded border-2 border-gray-300 data-[state=checked]:bg-[#1976D2] data-[state=checked]:border-[#1976D2]"
      />
    </div>
  );
}
