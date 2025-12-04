"use client";

import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalWeights } from "@/hooks/db/animal_weights/useAnimalWeights";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";

const WeightAnimalPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;

  const { animal, isLoading: animalLoading } = useAnimalById(id ?? null);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(id);

  const isLoading = animalLoading || weightsLoading;

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando dados de pesagem...</p>
        </div>
      </main>
    );
  }

  if (!animal) {
    return (
      <main>
        <Header title="Não encontrado" />
        <div className="p-4 text-center">
          <p>Animal não encontrado</p>
        </div>
      </main>
    );
  }

  const pesosMedidos = weights.map((w) => ({
    date: w.date,
    value: w.value,
  }));

  return (
    <main>
      <Header title={`${animal.serie_rgd} ${animal.rgn} - Pesagem`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-4">
        <div className="space-y-3">
          <DetailsWeightList pesosMedidos={pesosMedidos} gainDaily={[]} />

          {pesosMedidos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500 text-sm">Nenhum peso registrado</p>
              <Link
                className="bg-primary text-center py-2.5 uppercase text-white text-sm font-semibold w-3/4 rounded-lg"
                href="/pesagem"
              >
                + Pesagem
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default WeightAnimalPage;
