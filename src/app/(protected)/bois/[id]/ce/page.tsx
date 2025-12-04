"use client";

import Header from "@/components/layout/Header";
import { DetailsCircunfList } from "@/components/lists/DetailsCircunfList";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import { useAnimalCE } from "@/hooks/db/animal_ce/useAnimalCE";
import { useParams } from "next/navigation";
import Link from "next/link";

const CircunfAnimalPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;

  const { animal, isLoading: animalLoading } = useAnimalById(id);
  const { metrics: ceMetrics, isLoading: ceLoading } = useAnimalCE(
    id ?? undefined
  );

  const isLoading = animalLoading || ceLoading;

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando dados de CE...</p>
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

  return (
    <main>
      <Header title={`${animal.serie_rgd} ${animal.rgn} - CE`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-4">
        <div className="space-y-3">
          <DetailsCircunfList CEMedidos={ceMetrics} />

          {ceMetrics.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500 text-sm">Nenhum valor registrado</p>
              <Link
                className="bg-primary text-center py-2.5 uppercase text-white text-sm font-semibold w-3/4 rounded-lg"
                href="/pesagem"
              >
                + perímetro escrotal
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CircunfAnimalPage;
