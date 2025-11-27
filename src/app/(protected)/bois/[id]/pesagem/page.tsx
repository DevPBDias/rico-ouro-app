"use client";

import Header from "@/components/layout/Header";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DetailsWeightList } from "@/components/lists/DetailsWeightList";

const WeightAnimalPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { boi, isLoading, pesosMedidos } = useBoiDetail(id);

  if (isLoading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Pesagem`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-4">
        <div className="space-y-3">
          <DetailsWeightList pesosMedidos={pesosMedidos || []} gainDaily={[]} />

          {(!pesosMedidos || pesosMedidos.length === 0) && (
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
