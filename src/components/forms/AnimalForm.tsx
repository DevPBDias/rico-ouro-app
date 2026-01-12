"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Palette,
  Hash,
  MapPin,
  Activity,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useStatuses } from "@/hooks/db/statuses/useStatuses";
import { Animal } from "@/types/animal.type";

interface AnimalFormProps {
  onSubmit: (data: Partial<Animal>) => Promise<void>;
  isSubmitting: boolean;
  initialSex?: "M" | "F";
  initialData?: Partial<Animal>;
  title: string;
}

export function AnimalForm({
  onSubmit,
  isSubmitting,
  initialSex,
  initialData,
  title,
}: AnimalFormProps) {
  const { farms, isLoading: loadingFarms } = useFarms();
  const { statuses, isLoading: loadingStatuses } = useStatuses();

  const [formData, setFormData] = useState({
    rgn: initialData?.rgn || "",
    serie_rgd: initialData?.serie_rgd || "INDI",
    name: initialData?.name || "",
    sex: initialSex || initialData?.sex || "",
    born_date: initialData?.born_date || new Date().toISOString().split("T")[0],
    father_name: initialData?.father_name || "",
    mother_rgn: initialData?.mother_rgn || "",
    mother_serie_rgd: initialData?.mother_serie_rgd || "INDI",
    maternal_grandfather_name: initialData?.maternal_grandfather_name || "",
    paternal_grandfather_name: initialData?.paternal_grandfather_name || "",
    farm_id: initialData?.farm_id || "",
    status: initialData?.status || "Ativo",
    genotyping: initialData?.genotyping || "Não",
  });

  // Update form if initialData changes (useful for modals)
  useEffect(() => {
    if (initialData) {
      setFormData({
        rgn: initialData.rgn || "",
        serie_rgd: initialData.serie_rgd || "INDI",
        name: initialData.name || "",
        sex: initialSex || initialData.sex || "",
        born_date:
          initialData.born_date || new Date().toISOString().split("T")[0],
        father_name: initialData.father_name || "",
        mother_rgn: initialData.mother_rgn || "",
        mother_serie_rgd: initialData.mother_serie_rgd || "INDI",
        maternal_grandfather_name: initialData.maternal_grandfather_name || "",
        paternal_grandfather_name: initialData.paternal_grandfather_name || "",
        farm_id: initialData.farm_id || "",
        status: initialData.status || "Ativo",
        genotyping: initialData.genotyping || "Não",
      });
    }
  }, [initialData, initialSex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData: Partial<Animal> = {
      ...formData,
      sex: formData.sex as any,
      status: formData.status as any,
      genotyping: formData.genotyping,
    };
    await onSubmit(cleanData);
  };

  const isEditMode = !!initialData;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-4">
        {/* RGN e Série */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start justify-start gap-1.5 w-full">
            <label className="text-xs uppercase font-bold text-primary px-1">
              RGN
            </label>
            <div className="relative w-full">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.rgn}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rgn: e.target.value.toUpperCase(),
                  })
                }
                disabled={isEditMode}
                placeholder="Ex: 1234"
                className="py-5 pl-12 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                required
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-1.5 w-full">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Série/RGD
            </label>
            <div className="relative w-full">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.serie_rgd}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    serie_rgd: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ex: INDI"
                className="py-5 pl-12 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Nome e Genotipagem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-start justify-start gap-1.5 w-full">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Nome do Animal
            </label>
            <div className="relative w-full">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nome opcional"
                className="py-5 pl-12 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-1.5">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Genotipagem
            </label>
            <Select
              value={formData.genotyping}
              onValueChange={(value) =>
                setFormData({ ...formData, genotyping: value })
              }
            >
              <SelectTrigger className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm w-full">
                <SelectValue placeholder="Sim/Não" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim">Sim</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sexo e Data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start justify-start gap-1.5 w-full">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Sexo
            </label>
            <Select
              value={formData.sex}
              onValueChange={(value) =>
                setFormData({ ...formData, sex: value })
              }
              disabled={!!initialSex}
            >
              <SelectTrigger className="py-5 bg-muted/50 border-0 rounded-sm px-4 focus:ring-2 focus:ring-primary/20 shadow-sm w-full">
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Macho</SelectItem>
                <SelectItem value="F">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start justify-start gap-1.5 w-full">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Nascimento
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.born_date}
                onChange={(e) =>
                  setFormData({ ...formData, born_date: e.target.value })
                }
                className="py-5 px-4 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Genealogia (Pai e Mãe) */}
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
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="py-5 w-full text-base uppercase font-bold rounded-sm mt-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Salvando...
          </>
        ) : (
          <>{title}</>
        )}
      </Button>
    </form>
  );
}
