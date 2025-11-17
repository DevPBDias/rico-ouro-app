"use client";

import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { excluirPorRgn } from "@/utils/helpersDB";
import { Button } from "@/components/ui/button";
import detailsMatrizLinks from "@/constants/detailsMatrizLinks";
import useMatrizDB from "@/hooks/useMatrizDB";
import { useEffect, useState } from "react";
import DetailsMatrizButtons from "@/components/buttons/DetailsMatrizBtns";
import { Matriz } from "@/lib/dexie";

export default function DetailsMatrizPage() {
  const router = useRouter();
  const { rgn } = useParams();
  const { buscarPorRgn } = useMatrizDB();
  const [animal, setAnimal] = useState<Matriz | null>(null);

  useEffect(() => {
    if (!rgn) return;
    const rgnStr = Array.isArray(rgn) ? rgn[0] : rgn;
    const fetchData = async () => {
      const animalData = await buscarPorRgn(rgnStr);
      if (!animalData) {
        console.error(`Matriz com RGN ${rgnStr} não encontrada.`);
      }
      setAnimal(animalData || null);
    };
    fetchData();
  }, [rgn, buscarPorRgn]);

  function handleExcluir() {
    if (!animal || !animal?.rgn) {
      console.error("RGN do animal não disponível.");
      return;
    }

    excluirPorRgn(animal.rgn).then(() => {
      console.log(`Dados do animal com RGN ${animal.rgn} excluídos.`);
      router.push("/home");
    });
  }

  return (
    <main>
      <Header
        title={`${animal?.serieRGD ?? ""} ${animal?.rgn ?? ""}`}
      />
      <DetailsMatrizButtons data={detailsMatrizLinks} className="grid-cols-1" />
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
