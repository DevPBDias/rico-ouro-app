"use client";

import Header from "@/components/layout/Header";
import { DetailsCircunfList } from "@/components/lists/DetailsCircunfList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";
import Link from "next/link";

const CircunfAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - CE`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-4">
        <div className="space-y-3">
          <DetailsCircunfList
            CEMedidos={boi.animal.circunferenciaEscrotal || []}
          />

          {(!boi.animal.circunferenciaEscrotal ||
            boi.animal.circunferenciaEscrotal.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500 text-sm">Nenhum valor registrado</p>
              <Link
                className="bg-primary text-center py-2.5 uppercase text-white text-sm font-semibold w-3/4 rounded-lg"
                href="/pesagem"
              >
                + perimetro escrotal
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CircunfAnimalPage;
