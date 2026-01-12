"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { AnimalForm } from "@/components/forms/AnimalForm";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";
import { Animal } from "@/types/animal.type";

export default function CadastroMatrizPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRgn, setCreatedRgn] = useState("");

  const { createAnimal } = useCreateAnimal();

  const handleFormSubmit = async (data: Partial<Animal>) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Forçar o tipo como "Reprodutora" ou similar se necessário,
      // mas no esquema atual o que diferencia é o sexo e o uso.
      await createAnimal({ ...data, sex: "F" });
      setCreatedRgn(data.rgn || "");
      setShowModal(true);
    } catch (error: any) {
      console.error("Erro ao cadastrar matriz:", error);
      setErrorMessage(
        error?.message || "Ocorreu um erro ao salvar os dados. Verifique o RGN."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.replace("/matrizes"); // Volta para a consulta de matrizes
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header title="Cadastro de Matriz" />

      <main className="flex-1 px-6 py-8 pb-24 max-w-2xl mx-auto w-full">
        {errorMessage && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-destructive">Atenção</p>
              <p className="text-destructive/90">{errorMessage}</p>
            </div>
          </div>
        )}

        <AnimalForm
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          initialSex="F"
          title="Cadastrar Matriz"
        />
      </main>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2
                  className="w-10 h-10 text-green-500"
                  strokeWidth={2.5}
                />
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-foreground text-2xl font-bold">Sucesso!</h3>
                <p className="text-muted-foreground text-sm">
                  A matriz{" "}
                  <span className="font-bold text-primary">{createdRgn}</span>{" "}
                  foi cadastrada com sucesso.
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full mt-2">
                <Button
                  variant="default"
                  onClick={handleCloseModal}
                  className="h-14 w-full rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  OK, Voltar para Consulta
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
