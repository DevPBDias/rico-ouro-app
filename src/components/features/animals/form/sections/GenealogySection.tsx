"use client";
import { Input } from "@/components/ui/input";

interface GenealogySectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function GenealogySection({
  formData,
  setFormData,
}: GenealogySectionProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-muted">
      <h3 className="text-sm font-bold text-muted-foreground uppercase px-1">
        Genealogia
      </h3>

      <div className="flex flex-col items-start justify-start gap-1.5 w-full">
        <label className="text-xs uppercase font-bold text-primary px-1">
          Pai (Nome)
        </label>
        <Input
          value={formData.father_name}
          onChange={(e) =>
            setFormData({ ...formData, father_name: e.target.value })
          }
          placeholder="Nome do touro"
          className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            Mãe (RGN)
          </label>
          <Input
            value={formData.mother_rgn}
            onChange={(e) =>
              setFormData({
                ...formData,
                mother_rgn: e.target.value.toUpperCase(),
              })
            }
            placeholder="RGN mãe"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            Mãe (Série)
          </label>
          <Input
            value={formData.mother_serie_rgd}
            onChange={(e) =>
              setFormData({
                ...formData,
                mother_serie_rgd: e.target.value.toUpperCase(),
              })
            }
            placeholder="Ex: INDI"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            Avô Paterno
          </label>
          <Input
            value={formData.paternal_grandfather_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                paternal_grandfather_name: e.target.value,
              })
            }
            placeholder="Opcional"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-1.5 w-full">
          <label className="text-xs uppercase font-bold text-primary px-1">
            Avô Materno
          </label>
          <Input
            value={formData.maternal_grandfather_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                maternal_grandfather_name: e.target.value,
              })
            }
            placeholder="Opcional"
            className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
