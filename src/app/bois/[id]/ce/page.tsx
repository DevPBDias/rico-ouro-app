"use client";

import { AddPesoModal } from "@/components/AddPesoModal";
import Header from "@/components/layout/Header";
import { CircunfList } from "@/components/lists/CircunfList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { getTodayFormatted } from "@/utils/formatDates";
import { useParams } from "next/navigation";

const CircunfAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading, editCirc, deleteCirc, saveCircComMes } = useBoiDetail(
    Number.isNaN(id) ? null : id
  );

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  const handleAddCirc = (valor: number) => {
    const dataAtual = getTodayFormatted();
    saveCircComMes(dataAtual, valor);
  };

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Pesagem`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 px-4">
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-800 flex justify-between items-center">
            Circunferência Escrotal
            <AddPesoModal
              type="circunferencia"
              onAddPeso={(_, valor) => handleAddCirc(valor)}
            />
          </h2>

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
