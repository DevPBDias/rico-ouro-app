"use client";
import { ChartLineLabel } from "@/components/charts/BoiCharts";
import Header from "@/components/layout/Header";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";
import React from "react";

const GraphicsAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Gráficos`} />
      <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4 my-8">
        <h1 className="text-2xl font-bold mb-4 text-[#1162AE] border-b-2 border-[#1162AE] pb-2">
          Pesagem
        </h1>
        <ChartLineLabel
          title="Pesos"
          description="Evolução mensal"
          data={boi.animal.pesosMedidos ?? []}
          colorVar="--chart-1"
        />
        <h1 className="text-2xl font-bold my-4 text-[#1162AE] border-b-2 border-[#1162AE] pb-2">
          CE
        </h1>
        <ChartLineLabel
          title="Circunferência"
          description="Evolução mensal"
          data={boi.animal.circunferenciaEscrotal ?? []}
          colorVar="--chart-2"
        />
      </div>
    </main>
  );
};

export default GraphicsAnimalPage;
