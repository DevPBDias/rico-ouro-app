"use client";

import { AddPesoModal } from "@/components/AddPesoModal";
import Header from "@/components/layout/Header";
import { CircunfList } from "@/components/lists/CircunfList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";

const CircunfAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading, editCirc, deleteCirc, saveCircComMes } = useBoiDetail(
    Number.isNaN(id) ? null : id
  );

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  const handleAddCirc = (date: string, valor: number) => {
    saveCircComMes(date, valor);
  };

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - CE`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 px-4">
        <div className="space-y-3">
          <AddPesoModal
            type="circunferencia"
            onAddPeso={(date, valor) => handleAddCirc(date, valor)}
          />

          <CircunfList
            deleteCE={deleteCirc}
            editCE={editCirc}
            CEMedidos={boi.animal.circunferenciaEscrotal ?? []}
          />

          {(!boi.animal.circunferenciaEscrotal ||
            boi.animal.circunferenciaEscrotal.length === 0) && (
            <p className="text-gray-500 text-sm">Nenhum valor registrado</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default CircunfAnimalPage;
