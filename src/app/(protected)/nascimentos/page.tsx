"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  Weight,
  User,
  Palette,
  ArrowRight,
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
import Header from "@/components/layout/Header";

import { Animal } from "@/types/animal.type";
import { AnimalMetric } from "@/types/animal_metrics.type";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useCreateAnimalWeight } from "@/hooks/db/animal_weights/useCreateAnimalWeight";

export default function NascimentosPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
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

  const [finalRgnCreated, setFinalRgnCreated] = useState("");

  const { createAnimal } = useCreateAnimal();
  const { updateAnimal } = useUpdateAnimal();
  const { createWeight } = useCreateAnimalWeight();
  const { animals } = useAnimals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (formData.rgn.length > 10) {
      setErrorMessage(
        "O RGN deve ter no máximo 10 caracteres conforme o esquema.",
      );
      return;
    }

    if (formData.mae.length > 10) {
      setErrorMessage("O RGN da mãe deve ter no máximo 10 caracteres.");
      return;
    }

    if (!formData.mae) {
      setErrorMessage("O RGN da mãe é obrigatório.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find mother to inherit farm and update her status
      const mother = animals.find((a) => a.rgn === formData.mae);

      // Generate temporary RGN if blank: N<RGN da mãe>
      let finalRgn = formData.rgn;
      if (!finalRgn) finalRgn = `N${formData.mae}`;
      setFinalRgnCreated(finalRgn);

      const newAnimal: Partial<Animal> = {
        serie_rgd: "INDI",
        rgn: finalRgn,
        sex: formData.sexo === "Macho" ? "M" : "F",
        born_date: formData.data,
        born_color: formData.cor,
        mother_rgn: formData.mae,
        mother_serie_rgd: "INDI",
        status: "Ativo",
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
      await createWeight(bornWeightAnimal);

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

      setShowModal(true);
    } catch (error: any) {
      console.error("Erro ao cadastrar nascimento:", error);
      setErrorMessage(
        error?.message ||
          "Ocorreu um erro ao salvar os dados. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      rgn: "",
      data: new Date().toISOString().split("T")[0],
      peso: "",
      mae: "",
      cor: "Branco",
      sexo: "",
    });
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header title="Nascimentos" />

      <main className="flex-1 px-6 py-8 pb-24 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Novo Registro</h2>
          <p className="text-muted-foreground text-sm">
            Registre o nascimento de um novo animal no sistema.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-destructive">Atenção</p>
              <p className="text-destructive/90">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Campo Sexo */}
            <div className="space-y-2">
              <label
                htmlFor="sexo"
                className="text-xs uppercase font-bold text-primary px-1"
              >
                Sexo do Animal
              </label>
              <Select
                value={formData.sexo}
                onValueChange={(value) =>
                  setFormData({ ...formData, sexo: value })
                }
              >
                <SelectTrigger
                  id="sexo"
                  className="h-14 bg-muted/50 border-0 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Fêmea">Fêmea</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {formData.sexo && (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <label
                    htmlFor="rgn"
                    className="text-xs uppercase font-bold text-primary px-1"
                  >
                    RGN
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="rgn"
                      value={formData.rgn}
                      maxLength={10}
                      onChange={({ target }) =>
                        setFormData({
                          ...formData,
                          rgn: target.value.toUpperCase(),
                        })
                      }
                      className="h-14 pl-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                      placeholder="Identificação ou deixe em branco"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1 mt-1">
                    Deixe em branco para gerar ID temporário baseado na mãe.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="data"
                      className="text-xs uppercase font-bold text-primary px-1"
                    >
                      Data de Nascimento
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={({ target }) =>
                          setFormData({ ...formData, data: target.value })
                        }
                        className="h-14 pl-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="peso"
                      className="text-xs uppercase font-bold text-primary px-1"
                    >
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="peso"
                        type="text"
                        inputMode="decimal"
                        value={formData.peso}
                        onChange={({ target }) =>
                          setFormData({ ...formData, peso: target.value })
                        }
                        className="h-14 pl-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                        placeholder="00.0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="mae"
                    className="text-xs uppercase font-bold text-primary px-1"
                  >
                    RGN da Mãe
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mae"
                      value={formData.mae}
                      maxLength={10}
                      onChange={({ target }) =>
                        setFormData({
                          ...formData,
                          mae: target.value.toUpperCase(),
                        })
                      }
                      className="h-14 pl-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                      placeholder="Identificação da mãe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="cor"
                    className="text-xs uppercase font-bold text-primary px-1"
                  >
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
                      <SelectTrigger
                        id="cor"
                        className="h-14 pl-12 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 shadow-sm"
                      >
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Branco">Branco</SelectItem>
                          <SelectItem value="Vermelho">Vermelho</SelectItem>
                          <SelectItem value="Chuveirado">Chuveirado</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="default"
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 w-full text-base uppercase font-bold py-5 rounded-2xl mt-4 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 flex gap-2"
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
      </main>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2
                  className="w-10 h-10 text-green-500"
                  strokeWidth={2.5}
                />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-foreground text-2xl font-bold">Sucesso!</h3>
                <p className="text-muted-foreground text-sm">
                  O animal{" "}
                  <span className="font-bold text-primary">
                    {finalRgnCreated}
                  </span>{" "}
                  foi cadastrado com sucesso.
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full mt-2">
                <Button
                  variant="default"
                  onClick={handleCloseModal}
                  className="h-14 w-full rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Cadastrar outro
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/home")}
                  className="h-14 w-full rounded-2xl font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                >
                  Página Inicial
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
