"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAnimal, useAnimals } from "@/hooks/db";
import { useFarms } from "@/hooks/db/useFarms";
import { AnimalData } from "@/types/schemas.types";
import { v4 as uuidv4 } from "uuid";
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
    nasc: "",
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
          animal.animal?.rgn?.toLowerCase() ===
          formData.rgn.trim().toLowerCase()
      );

      if (existingAnimal) {
        newErrors.rgn = "Este RGN já está cadastrado no sistema";
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = "Sexo é obrigatório";
    }

    if (!formData.nasc) {
      newErrors.nasc = "Data de nascimento é obrigatória";
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
      const newAnimal: AnimalData = {
        uuid: uuidv4(),
        animal: {
          nome: "-",
          serieRGD: "INDI",
          rgn: formData.rgn,
          sexo: formData.sexo === "M" ? "M" : "F",
          nasc: formData.nasc,
          iabcgz: "-",
          deca: "-",
          p: "-",
          f: "-",
          corNascimento: "-",
          farm: formData.farm,
          status: { label: "Ativo", value: "ativo" },
          pesosMedidos: [],
          ganhoDiario: [],
          circunferenciaEscrotal: [],
          vacinas: [],
        },
        pai: {
          nome: "-",
        },
        mae: {
          serieRGD: "-",
          rgn: "-",
        },
        avoMaterno: {
          nome: "-",
        },
        _deleted: false,
        updatedAt: new Date().toISOString(),
      };

      await createAnimal(newAnimal);
      router.push("/consulta");
    } catch (error) {
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
                  Data de Nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="nasc"
                  value={formData.nasc}
                  onChange={handleChange}
                  className={`text-sm w-full rounded-lg border px-4 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                    errors.nasc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {errors.nasc && (
                  <p className="mt-1 text-sm text-red-500">{errors.nasc}</p>
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
                        key={farm.uuid}
                        value={farm.farmName}
                      >
                        {farm.farmName}
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
