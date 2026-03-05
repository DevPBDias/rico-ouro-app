"use client";
import { Input } from "@/components/ui/input";

interface GeneticDataSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function GeneticDataSection({
  formData,
  setFormData,
}: GeneticDataSectionProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-muted">
      <h3 className="text-sm font-bold text-muted-foreground uppercase px-1">
        Dados Genéticos
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            iABCZg
          </label>
          <Input
            value={formData.iabcgz}
            onChange={(e) =>
              setFormData({ ...formData, iabcgz: e.target.value })
            }
            placeholder="Opcional"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            DECA
          </label>
          <Input
            value={formData.deca}
            onChange={(e) =>
              setFormData({ ...formData, deca: e.target.value })
            }
            placeholder="Opcional"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
