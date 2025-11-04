"use client";

import Header from "@/components/layout/Header";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import { useParams } from "next/navigation";
import React from "react";

const DetailsAnimalPage = () => {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn} - Detalhes`} />
      <section className="p-4 mt-8">
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

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
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
                F%
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.f ?? "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center mb-2 gap-20">
            <div className="font-normal text-black flex flex-col gap-1">
              <span className="text-gray-400 text-sm font-medium uppercase">
                Cor Nascimento
              </span>
              <span className="font-bold uppercase  text-[#1162AE]">
                {boi.animal.corNascimento ?? "-"}
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
                    {vacina.nome} - {vacina.data}
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
