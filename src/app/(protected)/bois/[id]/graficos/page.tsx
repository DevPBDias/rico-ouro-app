"use client";

import { ChartLineLabel } from "@/components/charts/BoiCharts";
import Header from "@/components/layout/Header";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalWeights } from "@/hooks/db/animal_weights/useAnimalWeights";
import { useAnimalCE } from "@/hooks/db/animal_ce/useAnimalCE";
import { useParams } from "next/navigation";

const GraphicsAnimalPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { weights, isLoading: weightsLoading } = useAnimalWeights(
    id ?? undefined
  );
  const { metrics: ceMetrics, isLoading: ceLoading } = useAnimalCE(
    id ?? undefined
  );

  const isLoading = animalLoading || weightsLoading || ceLoading;

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando gráficos...</p>
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

  // Transformar dados para o formato do gráfico
  const weightData = (weights || []).map((w) => ({
    date: w.date,
    value: w.value,
  }));

  const ceData = (ceMetrics || []).map((ce) => ({
    date: ce.date,
    value: ce.value,
  }));

  return (
    <main>
      <Header title={`${animal.serie_rgd} ${animal.rgn} - Gráficos`} />
      <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4 my-8">
        <h1 className="text-2xl font-bold mb-4 text-[#1162AE] border-b-2 border-[#1162AE] pb-2">
          Pesagem
        </h1>
        <ChartLineLabel
          title="Pesos"
          description="Evolução mensal"
          data={weightData}
          colorVar="--chart-1"
        />
        <h1 className="text-2xl font-bold my-4 text-[#1162AE] border-b-2 border-[#1162AE] pb-2">
          CE
        </h1>
        <ChartLineLabel
          title="Circunferência Escrotal"
          description="Evolução mensal"
          data={ceData}
          colorVar="--chart-2"
        />
      </div>
    </main>
  );
};

export default GraphicsAnimalPage;
