"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { Animal } from "@/types/animal.type";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CadastroPage() {
  const router = useRouter();
  const { createAnimal, isLoading: isSaving } = useCreateAnimal();
  const { farms, isLoading: farmsLoading } = useFarms();
  const { animals } = useAnimals();

  const [formData, setFormData] = useState({
    rgn: "",
    sexo: "",
    farm: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.rgn.trim()) {
      newErrors.rgn = "RGN é obrigatório";
    } else {
      const existingAnimal = animals?.find(
        (animal) =>
          animal.rgn?.toLowerCase() === formData.rgn.trim().toLowerCase()
      );

      if (existingAnimal) {
        newErrors.rgn = "Este RGN já está cadastrado no sistema";
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = "Sexo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newAnimal: Partial<Animal> = {
        rgn: formData.rgn,
        name: "-",
        serie_rgd: "INDI",
        sex: formData.sexo === "M" ? "M" : "F",
        born_date: undefined,
        born_color: "-",
        iabcgz: "-",
        deca: "-",
        p: "-",
        f: "-",
        status: "-",
        farm_id: formData.farm || undefined,
        father_name: "-",
        mother_serie_rgd: "-",
        mother_rgn: "-",
        maternal_grandfather_name: "-",
        paternal_grandfather_name: "-",
      };

      await createAnimal(newAnimal);
      router.push("/consulta");
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      setErrors({ submit: "Erro ao cadastrar animal. Tente novamente." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 pb-8">
      <Header title="Cadastro Animal" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl px-4 pt-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block uppercase text-xs font-semibold text-primary">
                  RGN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rgn"
                  value={formData.rgn}
                  onChange={handleChange}
                  className={`text-sm w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                    errors.rgn
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder="Digitar RGN"
                />
                {errors.rgn && (
                  <p className="mt-1 text-sm text-red-500">{errors.rgn}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block uppercase text-xs font-semibold text-primary">
                  Sexo <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "sexo", value },
                    } as any)
                  }
                >
                  <SelectTrigger
                    className={`text-sm w-full ${
                      errors.sexo
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Macho</SelectItem>
                    <SelectItem value="F">Fêmea</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sexo && (
                  <p className="mt-1 text-sm text-red-500">{errors.sexo}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block uppercase text-xs font-semibold text-primary">
                  Fazenda
                </label>
                <Select
                  value={formData.farm}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: "farm", value },
                    } as any)
                  }
                  disabled={farmsLoading}
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Selecione uma fazenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem
                        className="uppercase"
                        key={farm.id}
                        value={farm.id}
                      >
                        {farm.farm_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 px-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              className="text-primary uppercase text-xs py-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="uppercase text-xs py-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Cadastrar
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
