"use client";

import Header from "@/components/layout/Header";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useAnimals } from "@/hooks/db";
import { useMemo, useState, useEffect } from "react";
import { AddPesoModal } from "@/components/modals/weight-ce-modal/AddPesoModal";
import { WeightList } from "@/components/lists/WeightList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { Button } from "@/components/ui/button";
import { CircunfList } from "@/components/lists/CircunfList";
import { AnimalData } from "@/types/schemas.types";

const PesagemPage = () => {
  const { animals: dados } = useAnimals();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ rgn: "" });
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [type, setType] = useState<string>("");
  const {
    boi,
    isLoading,
    editCirc,
    deleteCirc,
    saveCircComMes,
    savePesoComMes,
    editPeso,
    deletePeso,
    pesosMedidos,
    circunferenciaEscrotal,
  } = useBoiDetail(selectedAnimal?.uuid ?? null);

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label: animal.animal.rgn || "",
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  useEffect(() => {
    if (!formData.rgn) {
      setSelectedAnimal(null);
      return;
    }

    const a = dados.find(
      (d) => d.animal.rgn?.toLowerCase() === formData.rgn.toLowerCase()
    );
    setSelectedAnimal(a ?? null);
  }, [formData.rgn, dados]);

  const getPesosWithDefault = () => {
    const source = pesosMedidos;
    if (!source || source.length === 0) {
      const nascimento =
        boi?.animal?.nasc ||
        selectedAnimal?.animal?.nasc ||
        new Date().toISOString();
      return [{ uuid: "default", mes: nascimento, valor: 0 }];
    }
    return source;
  };

  const getCircWithDefault = () => {
    const source = circunferenciaEscrotal;
    if (!source || source.length === 0) {
      const nascimento =
        boi?.animal?.nasc ||
        selectedAnimal?.animal?.nasc ||
        new Date().toISOString();
      return [{ uuid: "default", mes: nascimento, valor: 0 }];
    }
    return source;
  };

  const handleAddPeso = async (date: string, valor: number) => {
    setError(null);
    try {
      await savePesoComMes(date, valor);
    } catch (err) {
      setError("Erro ao adicionar peso");
    }
  };

  const handleAddCE = async (date: string, valor: number) => {
    setError(null);
    try {
      await saveCircComMes(date, valor);
    } catch (err) {
      setError("Erro ao adicionar CE");
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
            />
          </div>

          <WeightList
            deletePeso={(index) => deletePeso(index)}
            editPeso={(index, valor) => editPeso(index, valor)}
            pesosMedidos={getPesosWithDefault()}
            gainDaily={selectedAnimal?.animal?.ganhoDiario || []}
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
            deleteCE={(index) => deleteCirc(index)}
            editCE={(index, valor) => editCirc(index, valor)}
            CEMedidos={getCircWithDefault()}
          />
        </section>
      )}
    </main>
  );
};

export default PesagemPage;
