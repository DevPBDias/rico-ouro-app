"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useDeleteAnimal } from "@/hooks/db";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import detailsAnimalLinks from "@/constants/detailsAnimalLinks";
import DetailsAnimalButtons from "@/components/buttons/DetailsAnimalButtons";
import { useBoiDetail } from "@/hooks/useBoiDetail";

export default function AnimalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { boi, isLoading } = useBoiDetail(id);
  const { deleteAnimal } = useDeleteAnimal();

  if (isLoading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  async function handleExcluir() {
    if (!boi || !boi.uuid) {
      console.error("UUID do animal não disponível.");
      return;
    }

    try {
      await deleteAnimal(boi.uuid);
      console.log(`Dados do animal com RGN ${boi.animal?.rgn} excluídos.`);
      router.push("/home");
    } catch (error) {
      console.error("Erro ao excluir animal:", error);
    }
  }

  return (
    <main>
      <Header title={`${boi.animal?.serieRGD} ${boi.animal?.rgn}`} />
      <DetailsAnimalButtons
        data={detailsAnimalLinks}
        className="grid-cols-1"
        animalId={id}
      />
      <Button
        variant="default"
        onClick={handleExcluir}
        className="mb-auto w-4/5 mx-auto mt-8 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
      >
        Excluir dados do animal
      </Button>
    </main>
  );
}
