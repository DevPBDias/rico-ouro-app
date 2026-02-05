"use client";

import React, { useState } from "react";
import {
  Loader2,
  AlertCircle,
  Calendar,
  Weight,
  User,
  Palette,
  ArrowRight,
  VenusAndMars,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useCreateAnimalWeight } from "@/hooks/db/animal_weights/useCreateAnimalWeight";
import { useMovements } from "@/hooks/db/movements/useMovements";
import { Animal } from "@/types/animal.type";
import { AnimalMetric } from "@/types/animal_metrics.type";

interface BirthFormProps {
  onSuccess?: () => void;
}

export function BirthForm({ onSuccess }: BirthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rgn: "",
    data: new Date().toISOString().split("T")[0],
    peso: "",
    mae: "",
    cor: "Branco",
    sexo: "",
  });

  const { createAnimal } = useCreateAnimal();
  const { updateAnimal } = useUpdateAnimal();
  const { createWeight } = useCreateAnimalWeight();
  const { createMovement } = useMovements();
  const { animals } = useAnimals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (formData.rgn.length > 10) {
      setErrorMessage("O RGN deve ter no máximo 10 caracteres.");
      return;
    }

    if (!formData.mae) {
      setErrorMessage("O RGN da mãe é obrigatório.");
      return;
    }

    if (!formData.sexo) {
      setErrorMessage("O sexo é obrigatório.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find mother to inherit farm and update her status
      const mother = animals.find((a) => a.rgn === formData.mae);

      // Generate temporary RGN if blank: N<RGN da mãe>
      let finalRgn = formData.rgn;
      if (!finalRgn) finalRgn = `N${formData.mae}`;

      const newAnimal: Partial<Animal> = {
        serie_rgd: "INDI",
        rgn: finalRgn,
        sex: formData.sexo === "Macho" ? "M" : "F",
        born_date: formData.data,
        born_color: formData.cor,
        mother_rgn: formData.mae,
        mother_serie_rgd: "INDI",
        status: "Ativo",
        animal_state: "ATIVO",
        farm_id: mother?.farm_id,
      };

      const bornWeightAnimal: Partial<AnimalMetric> = {
        rgn: finalRgn,
        value: Number(formData.peso.replace(",", ".")),
        born_metric: true,
        date: formData.data,
      };

      // 1. Create the animal
      await createAnimal(newAnimal);

      // 2. Add weight record
      if (formData.peso) {
        await createWeight(bornWeightAnimal);
      }

      // 3. Update mother if she exists
      if (mother) {
        await updateAnimal(mother.rgn, {
          condition: "Parida",
          parturition_from: {
            baby_sex: (formData.sexo === "Macho" ? "M" : "F") as any,
            baby_rgn: finalRgn,
          },
        });
      }

      // 4. Register Movement
      await createMovement({
        type: "nascimento",
        animal_id: finalRgn,
        date: formData.data,
        description: `Nascimento de ${finalRgn} (Mãe: ${formData.mae})`,
        details: {
          mother_rgn: formData.mae,
          sex: (formData.sexo === "Macho" ? "M" : "F") as "M" | "F",
          weight: Number(formData.peso.replace(",", ".")),
          born_date: formData.data,
        },
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao cadastrar nascimento:", error);
      setErrorMessage(error?.message || "Ocorreu um erro ao salvar os dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 border-t border-border pt-3">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary uppercase">
          Novo Nascimento
        </h2>
        <p className="text-muted-foreground text-sm">
          Registre o nascimento de um novo animal.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-destructive">Erro</p>
            <p className="text-destructive/90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div className="grid grid-cols-1 gap-6">
          {/* Campo Sexo */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-primary px-1">
              Sexo do Animal
            </label>
            <div className="relative">
              <VenusAndMars className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Select
                value={formData.sexo}
                onValueChange={(value) =>
                  setFormData({ ...formData, sexo: value })
                }
              >
                <SelectTrigger className="pl-12 bg-muted border-0 rounded-sm mt-1">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.sexo && (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-primary px-1">
                  RGN (Bezerro)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="baby-rgn-input"
                    name="babyRgn"
                    value={formData.rgn}
                    maxLength={10}
                    onChange={({ target }) =>
                      setFormData({
                        ...formData,
                        rgn: target.value.toUpperCase(),
                      })
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className="pl-12 bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                    placeholder="Deixe em branco p/ automático"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Data
                  </label>
                  <div className="relative">
                    <Input
                      id="birth-date-input"
                      name="birthDate"
                      type="date"
                      value={formData.data}
                      onChange={({ target }) =>
                        setFormData({ ...formData, data: target.value })
                      }
                      autoComplete="off"
                      className="bg-muted border-0 rounded-sm mt-1 text-sm placeholder:text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-primary px-1">
                    Peso (kg)
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birth-weight-input"
                      name="birthWeight"
                      type="text"
                      inputMode="decimal"
                      value={formData.peso}
                      onChange={({ target }) =>
                        setFormData({ ...formData, peso: target.value })
                      }
                      autoComplete="off"
                      spellCheck={false}
                      className="pl-12 bg-muted border-0 rounded-sm mt-1 placeholder:text-xs"
                      placeholder="00.0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-primary px-1">
                  RGN da Mãe
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mother-rgn-input"
                    name="motherRgn"
                    value={formData.mae}
                    maxLength={10}
                    onChange={({ target }) =>
                      setFormData({
                        ...formData,
                        mae: target.value.toUpperCase(),
                      })
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className="pl-12 bg-muted border-0 rounded-sm mt-1 text-sm placeholder:text-xs"
                    placeholder="Identificação da mãe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-primary px-1">
                  Pelagem / Cor
                </label>
                <div className="relative">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                  <Select
                    value={formData.cor}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cor: value })
                    }
                  >
                    <SelectTrigger className="pl-12 bg-muted border-0 rounded-sm mt-1 text-sm placeholder:text-xs">
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branco">Branco</SelectItem>
                      <SelectItem value="Vermelho">Vermelho</SelectItem>
                      <SelectItem value="Chuveirado">Chuveirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="default"
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base uppercase font-bold rounded-md h-12 mt-4 flex gap-2 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    Cadastrar Nascimento
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
