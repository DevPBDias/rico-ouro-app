"use client";

import { useParams } from "next/navigation";
import {
  ArrowUpNarrowWide,
  CircleDashed,
  CircleQuestionMark,
  FileBadge,
} from "lucide-react";
import { useBoiDetail } from "@/hooks/useBoiDetail";

import Header from "@/components/layout/Header";
import Link from "next/link";

export default function BoiDetalhePage() {
  const params = useParams();
  const id = Number(params.id);
  const { boi, loading } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn}`} />
      <section className="w-full bg-white px-6 py-16 grid grid-cols-2 gap-6">
        <Link
          href={`/bois/${id}/detalhes`}
          className="bg-[#1162AE] text-white w-full h-32 px-2 rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          <CircleQuestionMark width={24} height={24} />
          <p className="font-medium w-full text-center text-lg ">Detalhes</p>
        </Link>
        <Link
          href={`/bois/${id}/graficos`}
          className="bg-[#1162AE] text-white w-full h-32 px-2 rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          <ArrowUpNarrowWide width={24} height={24} />
          <p className="font-medium w-full text-center text-lg ">Gráficos</p>
        </Link>
        <Link
          href={`/bois/${id}/pesagem`}
          className="bg-[#1162AE] text-white w-full h-32 px-2 rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          <FileBadge width={24} height={24} />
          <p className="font-medium w-full text-center text-lg ">Pesagem</p>
        </Link>
        <Link
          href={`/bois/${id}/ce`}
          className="bg-[#1162AE] text-white w-full h-32 px-2 rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          <CircleDashed width={24} height={24} />
          <p className="font-medium w-full text-center text-lg ">CE</p>
        </Link>
      </section>
      <section className="p-4 space-y-6"></section>
    </main>
  );
}
