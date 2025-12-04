"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useDeleteAnimal } from "@/hooks/db/animals/useDeleteAnimal";
import { useAnimalById } from "@/hooks/db/animals/useAnimalById";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import detailsAnimalLinks from "@/constants/detailsAnimalLinks";
import DetailsAnimalButtons from "@/components/buttons/DetailsAnimalButtons";

export default function AnimalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { deleteAnimal } = useDeleteAnimal();
  const { animal } = useAnimalById(id);

  async function handleExcluir() {
    if (!animal || !animal.rgn) {
      return;
    }

    try {
      await deleteAnimal(animal.rgn);
      router.push("/home");
    } catch (error) {}
  }

  return (
    <main>
      <Header title={`${animal?.serie_rgd} ${animal?.rgn}`} />
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
