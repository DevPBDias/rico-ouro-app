"use client";

import { AddPesoModal } from "@/components/AddPesoModal";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeightList } from "@/components/weights/WeightList";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

const WeightAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const {
    boi,
    loading,
    editPeso,
    deletePeso,
    editCirc,
    deleteCirc,
    savePesoComMes,
    saveCircComMes,
  } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  // 🔸 Gera a data formatada no padrão "07 de Outubro de 2025"
  const getTodayFormatted = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  // 🔸 Quando adiciona o peso, já inclui a data automaticamente
  const handleAddPeso = (valor: number) => {
    const dataAtual = getTodayFormatted();
    savePesoComMes(dataAtual, valor);
  };

  // 🔸 Mesma lógica para circunferência escrotal
  const handleAddCirc = (valor: number) => {
    const dataAtual = getTodayFormatted();
    saveCircComMes(dataAtual, valor);
  };

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Pesagem`} />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 px-4">
        <div className="space-y-3">
          <h2 className="font-semibold text-xl text-[#1162AE] flex justify-between items-center">
            Pesos Medidos
            <AddPesoModal
              type="peso"
              onAddPeso={(_, valor) => handleAddPeso(valor)}
            />
          </h2>

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

        {/* 📏 Circunferência Escrotal */}
        <div className="bg-white shadow rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 flex justify-between items-center">
            Circunferência Escrotal
            <AddPesoModal
              type="circunferencia"
              onAddPeso={(_, valor) => handleAddCirc(valor)}
            />
          </h2>

          {boi.animal.circunferenciaEscrotal?.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">{c.mes}</div>
                <Input
                  type="number"
                  value={c.valor}
                  onChange={(e) => editCirc(i, e.target.value)}
                  placeholder="Circunferência em cm"
                  step="0.1"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteCirc(i)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {(!boi.animal.circunferenciaEscrotal ||
            boi.animal.circunferenciaEscrotal.length === 0) && (
            <p className="text-gray-500 text-sm">Nenhum valor registrado</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default WeightAnimalPage;
