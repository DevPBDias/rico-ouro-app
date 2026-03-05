"use client";
import { Hash, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface BasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  isEditMode: boolean;
  initialSex?: string;
}

export function BasicInfoSection({
  formData,
  setFormData,
  isEditMode,
  initialSex,
}: BasicInfoSectionProps) {
  return (
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
              disabled={isEditMode && !formData.rgn.startsWith("N")}
              placeholder="Ex: 1234"
              className="py-5 pl-12 bg-muted/50 border-0 rounded-sm focus:ring-2 focus:ring-primary/20 shadow-sm"
              required
            />
          </div>
          {isEditMode && formData.rgn.startsWith("T-") && (
            <p className="text-[10px] text-orange-500 font-medium px-1 mt-1">
              ID temporário. Você pode alterá-lo para o RGN definitivo agora.
            </p>
          )}
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
        <DatePicker
          label="Nascimento"
          value={formData.born_date}
          onChange={(value) => setFormData({ ...formData, born_date: value })}
          required
        />
      </div>
    </div>
  );
}
