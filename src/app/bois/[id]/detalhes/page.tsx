"use client";

import Header from "@/components/layout/Header";
import { EditAnimalModal } from "@/components/modals/edit-animal/EditAnimalModal";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { AnimalData } from "@/lib/db";
import { salvarOuAtualizarDados } from "@/utils/helpersDB";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormatData } from "@/utils/formatDates";

const DetailsAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading, reload } = useBoiDetail(Number.isNaN(id) ? null : id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSave = async (updatedAnimal: AnimalData) => {
    try {
      setSaveStatus({ type: null, message: "" });

      // Garante que o ID está presente para atualização
      if (!updatedAnimal.id && boi?.id) {
        updatedAnimal.id = boi.id;
      }

      // Salva/atualiza no banco de dados
      await salvarOuAtualizarDados([updatedAnimal]);

      // Recarrega os dados atualizados
      await reload();

      setSaveStatus({
        type: "success",
        message: "Informações do animal atualizadas com sucesso!",
      });

      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar animal:", error);
      setSaveStatus({
        type: "error",
        message: "Erro ao salvar as alterações. Tente novamente.",
      });
      throw error; // Re-lança para o modal tratar
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn}`} />

      <section className="p-4 mt-8">
        {/* Feedback de salvamento */}
        {saveStatus.type && (
          <div
            className={`mb-4 px-4 py-3 rounded-md ${
              saveStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <p className="text-sm font-medium">{saveStatus.message}</p>
          </div>
        )}

        {/* Botão para abrir modal de edição */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => setIsEditOpen(true)}
            className="bg-white text-primary border border-[#1162AE] hover:bg-[#0e4e8a] w-full text-sm uppercase mb-2"
          >
            Editar Informações
          </Button>
        </div>

        <EditAnimalModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          data={boi}
          onSave={handleSave}
        />
        <div className="flex flex-row justify-start items-center gap-2 mb-3 border-b-2 border-[#1162AE] pb-2">
          <span className="text-gray-400 text-sm font-medium uppercase">
            fazenda
          </span>
          <p className="font-bold uppercase text-lg text-[#1162AE]">
            {boi.animal.farm ?? "SEM DADO"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4 text-base pb-8">
          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Sexo
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal?.sexo === "M" ? "Macho" : "Fêmea"}
              </span>
            </div>

            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Nascimento
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.nasc ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                iABCZg
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.iabcgz ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                DECA
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.deca ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-start mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Pai
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.pai?.nome ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Mãe
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {`${boi.mae?.serieRGD ?? "-"} ${boi.mae?.rgn ?? ""}`.trim()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                P%
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.p ?? "-"}
              </span>
            </div>
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                avô MATERNO
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.avoMaterno?.nome ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                F%
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.f ?? "-"}
              </span>
            </div>

            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Status
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.status ?? "-"}
              </span>
            </div>
          </div>

          <div className="md:col-span-3">
            <span className="text-gray-400 text-sm font-medium uppercase">
              Vacinas:
            </span>
            <ul className="list-disc list-inside mt-1">
              {boi.animal.vacinas && boi.animal.vacinas.length > 0 ? (
                boi.animal.vacinas.map((vacina, index) => (
                  <li
                    className="font-bold uppercase  text-[#1162AE]"
                    key={index}
                  >
                    {vacina.nome} - {FormatData(vacina.data)}
                  </li>
                ))
              ) : (
                <span className="font-bold uppercase  text-[#1162AE]">
                  Sem vacinas anotadas
                </span>
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DetailsAnimalPage;
