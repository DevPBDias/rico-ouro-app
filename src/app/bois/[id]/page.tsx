"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { ChartBarLabel } from "@/components/BoiCharts";
import { AddPesoModal } from "@/components/AddPesoModal";

export default function BoiDetalhePage() {
  const params = useParams();
  const router = useRouter();
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Detalhes do Boi</h1>
      <Button className="mb-16" variant="outline" onClick={() => router.back()}>
        Voltar
      </Button>
      <div className="text-gray-700 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium">RGN:</span> {boi.animal.rgn ?? "-"}
          </div>
          <div>
            <span className="font-medium">Série/RGD:</span>{" "}
            {boi.animal.serieRGD ?? "-"}
          </div>
          <div>
            <span className="font-medium">Sexo:</span> {boi.animal.sexo ?? "-"}
          </div>
          <div>
            <span className="font-medium">Nascimento:</span>{" "}
            {boi.animal.nasc ?? "-"}
          </div>
          <div>
            <span className="font-medium">iABCZg:</span>{" "}
            {boi.animal.iabcgz ?? "-"}
          </div>
          <div>
            <span className="font-medium">DECA:</span> {boi.animal.deca ?? "-"}
          </div>
          <div>
            <span className="font-medium">P%:</span> {boi.animal.p ?? "-"}
          </div>
          <div>
            <span className="font-medium">F%:</span> {boi.animal.f ?? "-"}
          </div>
          <div>
            <span className="font-medium">Pai:</span> {boi.pai?.nome ?? "-"}
          </div>
          <div>
            <span className="font-medium">Mãe:</span>{" "}
            {`${boi.mae?.serieRGD ?? "-"} ${boi.mae?.rgn ?? ""}`.trim()}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pesos */}
        <div className="bg-white shadow rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 flex justify-between items-center">
            Pesos Medidos
            <AddPesoModal
              type="peso"
              onAddPeso={(mes, valor) => savePesoComMes(mes, valor)}
            />
          </h2>
          {boi.animal.pesosMedidos?.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">{p.mes}</div>
                <Input
                  type="number"
                  value={p.valor}
                  onChange={(e) => editPeso(i, e.target.value)}
                  placeholder="Peso em kg"
                  step="0.1"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deletePeso(i)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(!boi.animal.pesosMedidos ||
            boi.animal.pesosMedidos.length === 0) && (
            <p className="text-gray-500 text-sm">Nenhum peso registrado</p>
          )}
        </div>

        {/* Circunferência Escrotal */}
        <div className="bg-white shadow rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-800 flex justify-between items-center">
            Circunferência Escrotal
            <AddPesoModal
              type="circunferencia"
              onAddPeso={(mes, valor) => saveCircComMes(mes, valor)}
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <ChartBarLabel
          title="Pesos"
          description="Evolução mensal"
          data={boi.animal.pesosMedidos ?? []}
          colorVar="--chart-1"
        />
        <ChartBarLabel
          title="Circunferência"
          description="Evolução mensal"
          data={boi.animal.circunferenciaEscrotal ?? []}
          colorVar="--chart-2"
        />
      </div>
    </div>
  );
}
