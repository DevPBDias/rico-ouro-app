"use client";

import Header from "@/components/layout/Header";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useMemo, useState, useEffect } from "react";
import { AddPesoModal } from "@/components/modals/weight-ce-modal/AddPesoModal";
import { WeightList } from "@/components/lists/WeightList";
import { Button } from "@/components/ui/button";
import { CircunfList } from "@/components/lists/CircunfList";
import { Animal } from "@/types/animal.type";
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
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [type, setType] = useState<string>("");
  const [isBorn, setIsBorn] = useState<boolean>(false);

  const { weights: pesosMedidos, isLoading: loadingWeights } = useAnimalWeights(
    selectedAnimal?.rgn
  );
  const { createWeight } = useCreateAnimalWeight();
  const { updateWeight } = useUpdateAnimalWeight();
  const { deleteWeight } = useDeleteAnimalWeight();

  const { metrics: circunferenciaEscrotal, isLoading: loadingCE } = useAnimalCE(
    selectedAnimal?.rgn
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

  useEffect(() => {
    if (!formData.rgn) {
      setSelectedAnimal(null);
      return;
    }

    const a = dados.find(
      (d) => d.rgn?.toLowerCase() === formData.rgn.toLowerCase()
    );
    setSelectedAnimal(a ?? null);
  }, [formData.rgn, dados]);

  const getPesosWithDefault = (): AnimalMetric[] => {
    if (!pesosMedidos || pesosMedidos.length === 0) {
      const nascimento = selectedAnimal?.born_date || new Date().toISOString();
      return [
        {
          id: "0",
          rgn: selectedAnimal?.rgn || "",
          date: nascimento,
          value: 0,
          _deleted: false,
        },
      ];
    }
    return pesosMedidos;
  };

  const getCircWithDefault = (): AnimalMetric[] => {
    if (!circunferenciaEscrotal || circunferenciaEscrotal.length === 0) {
      const nascimento = selectedAnimal?.born_date || new Date().toISOString();
      return [
        {
          id: "0",
          rgn: selectedAnimal?.rgn || "",
          date: nascimento,
          value: 0,
          _deleted: false,
        },
      ];
    }
    return circunferenciaEscrotal;
  };

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
      });
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
          <label
            htmlFor="rgn"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Animal (RGN):
          </label>
          <RgnAutocomplete
            options={rgnOptions}
            value={formData.rgn}
            onSelect={(rgn) => setFormData((prev) => ({ ...prev, rgn }))}
          />
        </div>
      </form>

      {selectedAnimal && !isLoading && (
        <div className="w-full px-6 mb-4 flex flex-col items-center gap-2">
          <h2 className="text-primary font-bold text-sm uppercase w-full text-left">
            Tipo de Medição
          </h2>
          <div className="w-full grid grid-cols-2 gap-4 items-center justify-center">
            <Button
              variant="outline"
              onClick={() => setType("pesagem")}
              className="text-primary border-primary font-semibold text-sm uppercase w-full"
            >
              Pesagem
            </Button>
            <Button
              variant="outline"
              onClick={() => setType("circunferencia")}
              className="text-primary border-primary font-semibold text-sm uppercase w-full"
            >
              Perím. Escrotal
            </Button>
          </div>
        </div>
      )}

      {selectedAnimal && type === "pesagem" && (
        <section className="w-full px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-primary font-bold text-sm uppercase w-full text-left">
              Pesos
            </h2>
            <AddPesoModal
              type="peso"
              onAddPeso={(date, valor) => handleAddPeso(date, valor)}
              isBorn={isBorn}
              setIsBorn={setIsBorn}
            />
          </div>

          <WeightList
            deletePeso={(id) => handleDeletePeso(id)}
            editPeso={(id, valor) => handleEditPeso(id, valor)}
            pesosMedidos={getPesosWithDefault()}
            gainDaily={[]}
          />
        </section>
      )}
      {selectedAnimal && type === "circunferencia" && (
        <section className="w-full px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-primary font-bold text-sm uppercase w-full text-left">
              Perímetro Escrotal
            </h2>
            <AddPesoModal type="circunferencia" onAddPeso={handleAddCE} />
          </div>

          <CircunfList
            deleteCE={(id) => handleDeleteCE(id)}
            editCE={(id, valor) => handleEditCE(id, valor)}
            CEMedidos={getCircWithDefault()}
          />
        </section>
      )}
    </main>
  );
};

export default PesagemPage;
