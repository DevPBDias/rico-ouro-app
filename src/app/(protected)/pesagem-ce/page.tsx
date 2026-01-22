"use client";

import Header from "@/components/layout/Header";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useMemo, useState } from "react";
import { AddPesoModal } from "@/components/modals/weight-ce-modal/AddPesoModal";
import { WeightList } from "@/components/lists/WeightList";
import { Button } from "@/components/ui/button";
import { CircunfList } from "@/components/lists/CircunfList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { X } from "lucide-react";
import { AnimalMetric } from "@/types/animal_metrics.type";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useAnimalWeights } from "@/hooks/db/animal_weights/useAnimalWeights";
import { useCreateAnimalWeight } from "@/hooks/db/animal_weights/useCreateAnimalWeight";
import { useUpdateAnimalWeight } from "@/hooks/db/animal_weights/useUpdateAnimalWeight";
import { useDeleteAnimalWeight } from "@/hooks/db/animal_weights/useDeleteAnimalWeight";
import { useAnimalCE } from "@/hooks/db/animal_ce/useAnimalCE";
import { useCreateAnimalCE } from "@/hooks/db/animal_ce/useCreateAnimalCE";
import { useUpdateAnimalCE } from "@/hooks/db/animal_ce/useUpdateAnimalCE";
import { useDeleteAnimalCE } from "@/hooks/db/animal_ce/useDeleteAnimalCE";

const PesagemPage = () => {
  const { animals: dados } = useAnimals();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ rgn: "" });
  const [type, setType] = useState<string>("pesagem");
  const [isBorn, setIsBorn] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState({ open: false, title: "" });

  // Deriva selectedAnimal diretamente do array reativo (useMemo)
  // Isso garante que a UI sempre mostra os dados mais atuais do RxDB
  const selectedAnimal = useMemo(() => {
    if (!formData.rgn) return null;
    return (
      dados.find((d) => d.rgn?.toLowerCase() === formData.rgn.toLowerCase()) ??
      null
    );
  }, [formData.rgn, dados]);

  const { weights: pesosMedidos, isLoading: loadingWeights } = useAnimalWeights(
    selectedAnimal?.rgn,
  );
  const { createWeight } = useCreateAnimalWeight();
  const { updateWeight } = useUpdateAnimalWeight();
  const { deleteWeight } = useDeleteAnimalWeight();

  const { metrics: circunferenciaEscrotal, isLoading: loadingCE } = useAnimalCE(
    selectedAnimal?.rgn,
  );
  const { createCE } = useCreateAnimalCE();
  const { updateCE } = useUpdateAnimalCE();
  const { deleteCE } = useDeleteAnimalCE();

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label: animal.rgn || "",
        value: animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  const handleAddPeso = async (date: string, valor: number) => {
    setError(null);
    if (!selectedAnimal?.rgn) {
      setError("Selecione um animal");
      return;
    }

    try {
      await createWeight({
        rgn: selectedAnimal.rgn,
        date,
        value: valor,
        born_metric: isBorn,
      });
      setIsBorn(false);
      setSuccessModal({ open: true, title: "Peso registrado!" });
    } catch (err) {
      console.error("Erro ao adicionar peso:", err);
      setError("Erro ao adicionar peso");
    }
  };

  const handleAddCE = async (date: string, valor: number) => {
    setError(null);
    if (!selectedAnimal?.rgn) {
      setError("Selecione um animal");
      return;
    }

    try {
      await createCE({
        rgn: selectedAnimal.rgn,
        date,
        value: valor,
        born_metric: isBorn,
      });
      setIsBorn(false);
      setSuccessModal({ open: true, title: "CE registrada!" });
    } catch (err) {
      console.error("Erro ao adicionar CE:", err);
      setError("Erro ao adicionar CE");
    }
  };

  const handleEditPeso = async (id: string, valor: number) => {
    try {
      await updateWeight(id, { value: valor });
    } catch (err) {
      console.error("Erro ao editar peso:", err);
      setError("Erro ao editar peso");
    }
  };

  const handleDeletePeso = async (id: string) => {
    try {
      await deleteWeight(id);
    } catch (err) {
      console.error("Erro ao deletar peso:", err);
      setError("Erro ao deletar peso");
    }
  };

  const handleEditCE = async (id: string, valor: number) => {
    try {
      await updateCE(id, { value: valor });
    } catch (err) {
      console.error("Erro ao editar CE:", err);
      setError("Erro ao editar CE");
    }
  };

  const handleDeleteCE = async (id: string) => {
    try {
      await deleteCE(id);
    } catch (err) {
      console.error("Erro ao deletar CE:", err);
      setError("Erro ao deletar CE");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.rgn) {
      setError("Selecione um animal (RGN)");
      return;
    }
  };

  const isLoading = loadingWeights || loadingCE;

  return (
    <main className="min-h-screen">
      <Header title="Pesagem / CE" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col justify-start items-start w-full gap-2 relative">
          {!selectedAnimal ? (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-500">
              <label
                htmlFor="rgn"
                className="text-primary font-bold text-xs uppercase block mb-2"
              >
                Animal (RGN):
              </label>
              <RgnAutocomplete
                options={rgnOptions}
                value={formData.rgn}
                onSelect={(rgn) => setFormData((prev) => ({ ...prev, rgn }))}
              />
            </div>
          ) : (
            <div className="w-full bg-primary/5 border border-primary/20 p-4 rounded-2xl flex justify-between items-center animate-in zoom-in-95 duration-300 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase mb-0.5">
                  Animal Selecionado
                </span>
                <p className="text-xl font-black text-primary leading-none">
                  {selectedAnimal.rgn}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ rgn: "" })}
                className="text-destructive/70 hover:text-white hover:bg-destructive h-10 w-10 p-0 rounded-xl transition-all group border border-destructive/10"
              >
                <X className="w-5 h-5 group-hover:scale-110" />
              </Button>
            </div>
          )}
        </div>
      </form>

      {selectedAnimal && !isLoading && (
        <div className="w-full px-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Tabs value={type} onValueChange={setType} className="w-full">
            <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide mb-4">
              <TabsList className="flex w-max min-w-full bg-muted/30 rounded-xl p-1 h-auto gap-0.5 border border-border">
                <TabsTrigger
                  value="pesagem"
                  className="flex-1 min-w-[120px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                >
                  Pesagem
                </TabsTrigger>
                <TabsTrigger
                  value="circunferencia"
                  className="flex-1 min-w-[120px] py-2.5 px-2 text-[11px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all rounded-lg"
                >
                  Perím. Escrotal
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="pesagem"
              className="mt-0 ring-offset-background focus-visible:outline-none"
            >
              <section className="w-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-primary font-bold text-xs uppercase w-full text-left">
                    Histórico de Pesos
                  </h2>
                  <AddPesoModal
                    type="peso"
                    onAddPeso={(date, valor) => handleAddPeso(date, valor)}
                    isBorn={isBorn}
                    setIsBorn={setIsBorn}
                    bornDate={selectedAnimal?.born_date}
                    lastValue={pesosMedidos[pesosMedidos.length - 1]?.value}
                  />
                </div>

                {pesosMedidos.length > 0 ? (
                  <WeightList
                    deletePeso={(id) => handleDeletePeso(id)}
                    editPeso={(id, valor) => handleEditPeso(id, valor)}
                    pesosMedidos={pesosMedidos}
                    gainDaily={[]}
                  />
                ) : (
                  <div className="mt-8 text-center text-muted-foreground bg-muted/20 py-8 rounded-xl border border-dashed border-border">
                    Nenhum peso registrado ainda.
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent
              value="circunferencia"
              className="mt-0 ring-offset-background focus-visible:outline-none"
            >
              <section className="w-full">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-primary font-bold text-xs uppercase w-full text-left">
                    Histórico de Perímetro
                  </h2>
                  <AddPesoModal
                    type="circunferencia"
                    onAddPeso={handleAddCE}
                    isBorn={isBorn}
                    setIsBorn={setIsBorn}
                    bornDate={selectedAnimal?.born_date}
                    lastValue={
                      circunferenciaEscrotal[circunferenciaEscrotal.length - 1]
                        ?.value
                    }
                  />
                </div>

                {circunferenciaEscrotal.length > 0 ? (
                  <CircunfList
                    deleteCE={(id) => handleDeleteCE(id)}
                    editCE={(id, valor) => handleEditCE(id, valor)}
                    CEMedidos={circunferenciaEscrotal}
                  />
                ) : (
                  <div className="mt-8 text-center text-muted-foreground bg-muted/20 py-8 rounded-xl border border-dashed border-border">
                    Nenhuma medição registrada ainda.
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
        title={successModal.title}
      />
    </main>
  );
};

export default PesagemPage;
