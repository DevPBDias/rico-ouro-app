"use client";

import { useParams, useRouter } from "next/navigation";
import { useMatriz, useDeleteMatriz } from "@/hooks/db";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import detailsMatrizLinks from "@/constants/detailsMatrizLinks";
import DetailsMatrizButtons from "@/components/buttons/DetailsMatrizBtns";
import Link from "next/link";
import { use } from "react";

export default function MatrizDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { matriz, isLoading } = useMatriz(id);
  const { deleteMatriz } = useDeleteMatriz();

  if (isLoading) return <p>Carregando...</p>;
  if (!matriz) return <p>Matriz não encontrada</p>;

  async function handleExcluir() {
    if (!matriz || !matriz.uuid) {
      return;
    }

    try {
      await deleteMatriz(matriz.uuid);
      router.push("/matrizes");
    } catch (error) {}
  }

  return (
    <main>
      <Header title={`${matriz.serieRGD ?? ""} ${matriz.rgn ?? ""}`} />
      <DetailsMatrizButtons
        matrizId={id}
        data={detailsMatrizLinks}
        className="grid-cols-1"
      />
      <Button
        variant="default"
        onClick={handleExcluir}
        className="mb-auto w-4/5 mx-auto mt-8 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
      >
        Excluir dados da matriz
      </Button>
    </main>
  );
}
