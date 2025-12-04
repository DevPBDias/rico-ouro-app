"use client";

import { useRouter } from "next/navigation";
import { useMatrizById } from "@/hooks/matrizes/useMatrizById";
import { useDeleteAnimal } from "@/hooks/db/animals/useDeleteAnimal";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import detailsMatrizLinks from "@/constants/detailsMatrizLinks";
import DetailsMatrizButtons from "@/components/buttons/DetailsMatrizBtns";
import { use } from "react";

export default function MatrizDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { matriz, isLoading } = useMatrizById(id);
  const { deleteAnimal } = useDeleteAnimal();

  if (isLoading) {
    return (
      <main>
        <Header title="Carregando..." />
        <div className="p-4 text-center">
          <p>Carregando dados da matriz...</p>
        </div>
      </main>
    );
  }

  if (!matriz) {
    return (
      <main>
        <Header title="Não encontrado" />
        <div className="p-4 text-center">
          <p>Matriz não encontrada</p>
        </div>
      </main>
    );
  }

  async function handleExcluir() {
    if (!matriz || !matriz.rgn) {
      return;
    }

    try {
      await deleteAnimal(matriz.rgn);
      router.push("/matrizes");
    } catch (error) {
      console.error("Erro ao excluir matriz:", error);
    }
  }

  return (
    <main>
      <Header title={`${matriz.serie_rgd ?? ""} ${matriz.rgn ?? ""}`} />
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
