"use client";

import { AddPesoModal } from "@/components/AddPesoModal";
import Header from "@/components/layout/Header";
import { WeightList } from "@/components/lists/WeightList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";

const WeightAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading, editPeso, deletePeso, savePesoComMes } = useBoiDetail(
    Number.isNaN(id) ? null : id
  );

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  const handleAddPeso = (date: string, valor: number) => {
    savePesoComMes(date, valor);
  };

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Pesagem`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 px-4">
        <div className="space-y-3">
          <AddPesoModal
            type="peso"
            onAddPeso={(date, valor) => handleAddPeso(date, valor)}
          />

          <WeightList
            deletePeso={deletePeso}
            editPeso={editPeso}
            pesosMedidos={boi.animal.pesosMedidos ?? []}
          />

          {(!boi.animal.pesosMedidos ||
            boi.animal.pesosMedidos.length === 0) && (
            <p className="text-gray-500 text-sm">Nenhum peso registrado</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default WeightAnimalPage;
