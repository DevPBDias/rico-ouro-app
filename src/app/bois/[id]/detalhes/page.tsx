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
        <h1 className="text-2xl font-bold mb-4 text-[#1162AE] border-b-2 border-[#1162AE] pb-2">
          {boi.animal.serieRGD ?? "-"} {boi.animal.rgn ?? "-"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 text-base border-b-2 border-[#1162AE] pb-8">
          <p className="font-normal text-black">
            <span className="font-semibold text-lg  text-[#1162AE] ">
              Sexo:
            </span>{" "}
            {boi.animal.sexo ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">
              Nascimento:
            </span>{" "}
            {boi.animal.nasc ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">
              iABCZg:
            </span>{" "}
            {boi.animal.iabcgz ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">DECA:</span>{" "}
            {boi.animal.deca ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">P%:</span>{" "}
            {boi.animal.p ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">F%:</span>{" "}
            {boi.animal.f ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">Pai:</span>{" "}
            {boi.pai?.nome ?? "-"}
          </p>
          <p>
            <span className="font-semibold text-lg text-[#1162AE]">Mãe:</span>{" "}
            {`${boi.mae?.serieRGD ?? "-"} ${boi.mae?.rgn ?? ""}`.trim()}
          </p>
          {boi.animal.corNascimento && (
            <p>
              <span className="font-semibold text-lg text-[#1162AE]">
                Cor de Nascimento:
              </span>{" "}
              {boi.animal.corNascimento ?? "-"}
            </p>
          )}
          {boi.animal.vacinas && boi.animal.vacinas.length > 0 && (
            <div className="md:col-span-3">
              <span className="font-semibold text-lg text-[#1162AE]">
                Vacinas:
              </span>
              <ul className="list-disc list-inside mt-1">
                {boi.animal.vacinas.map((vacina, index) => (
                  <li key={index}>
                    {vacina.nome} - {vacina.data}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold mb-4 text-[#1162AE] mt-8">
            Observações:
          </h1>
          <p>Nenhuma observação.</p>
        </div>
      </section>
    </main>
  );
};

export default DetailsAnimalPage;
