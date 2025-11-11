"use client";

import { useParams, useRouter } from "next/navigation";
import { useBoiDetail } from "@/hooks/useBoiDetail";
import Header from "@/components/layout/Header";
import { excluirPorRgn } from "@/utils/helpersDB";
import { Button } from "@/components/ui/button";
import detailsAnimalLinks from "@/constants/detailsAnimalLinks";
import DetailsAnimalButtons from "@/components/buttons/DetailsAnimalButtons";

export default function BoiDetalhePage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { boi, loading } = useBoiDetail(Number.isNaN(id) ? null : id);

  if (loading) return <p>Carregando...</p>;
  if (!boi) return <p>Boi não encontrado</p>;

  function handleExcluir() {
    if (!boi || !boi.animal.rgn) {
      console.error("RGN do animal não disponível.");
      return;
    }

    excluirPorRgn(boi.animal.rgn).then(() => {
      console.log(`Dados do animal com RGN ${boi.animal.rgn} excluídos.`);
      router.push("/home");
    });
  }

  return (
    <main>
      <Header title={`${boi.animal.serieRGD} ${boi.animal.rgn}`} />
      <DetailsAnimalButtons data={detailsAnimalLinks} className="grid-cols-1" />
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
