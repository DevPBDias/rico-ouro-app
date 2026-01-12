"use client";

import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import Link from "next/link";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import SearchCard from "../cards/SearchCard";
import DetailsAnimalLayout from "../details-animals/DetailsAnimalLayout";

function SearchAnimal() {
  const { animals, isLoading } = useAnimals();
  const [searchQuery, setSearchQuery] = useState("");
  // Armazena apenas o RGN, não o objeto completo
  const [selectedRgn, setSelectedRgn] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Deriva os resultados da busca diretamente do array reativo
  // Quando RxDB emitir novos dados, animals atualiza e searchResults recalcula
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    // Match exato primeiro
    const exactMatch = animals.find(
      (animal) => animal.rgn?.toLowerCase() === query
    );
    if (exactMatch) return [exactMatch];

    // Busca parcial
    return animals.filter((animal) => {
      const rgn = animal.rgn?.toString().toLowerCase() || "";
      const name = animal.name?.toLowerCase() || "";
      const serieRgd = animal.serie_rgd?.toLowerCase() || "";

      return (
        rgn.includes(query) || name.includes(query) || serieRgd.includes(query)
      );
    });
  }, [animals, searchQuery]);

  // Deriva o animal selecionado do array reativo usando o RGN
  // Isso garante que sempre mostramos os dados mais atuais
  const selectedAnimal = useMemo(() => {
    if (!selectedRgn) return null;
    return animals.find((a) => a.rgn === selectedRgn) || null;
  }, [animals, selectedRgn]);

  const hasSearched = searchQuery.trim().length > 0;

  const handleSelectAnimal = (rgn: string) => {
    setSelectedRgn(rgn);
    setShowDetails(true);
  };

  const handleBackToSearch = () => {
    setShowDetails(false);
    setSelectedRgn(null);
  };

  if (showDetails && selectedAnimal) {
    return (
      <section className="px-4 py-4">
        <button
          onClick={handleBackToSearch}
          className="flex items-center text-[#1162AE] font-medium hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para busca
        </button>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-primary font-semibold">
            {selectedAnimal.serie_rgd} {selectedAnimal.rgn}
          </p>
        </div>

        <DetailsAnimalLayout rgn={selectedAnimal.rgn} />
      </section>
    );
  }

  return (
    <section className="px-4">
      <div className="py-3 border-b border-border">
        <label
          htmlFor="search-animal"
          className="text-base font-bold text-[#1162AE] uppercase"
        >
          Buscar Animal:
        </label>
        <div className="relative mt-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-animal"
            type="text"
            className="placeholder:text-sm placeholder:text-gray-400 pl-2 bg-white border border-gray-200 rounded-lg text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o RGN, nome ou série do animal..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 my-4">
          <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
            Carregando...
          </h2>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonSearchAnimal key={index} />
          ))}
        </div>
      ) : (
        <div className="my-4">
          {hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1162AE] mb-1">
                    {searchResults.length === 1
                      ? "Animal encontrado:"
                      : `Resultados encontrados (${searchResults.length}):`}
                  </h2>
                  {searchResults.length > 1 && (
                    <p className="text-sm text-gray-500 mb-3">
                      Toque em um animal para ver os detalhes
                    </p>
                  )}
                  <div className="grid gap-3">
                    {searchResults.map((animal) => (
                      <div
                        key={animal.rgn}
                        onClick={() => handleSelectAnimal(animal.rgn)}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded-lg transition-all active:scale-[0.98]"
                      >
                        <SearchCard
                          animal={animal}
                          onDetailsClick={() => handleSelectAnimal(animal.rgn)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <p className="text-base text-center font-medium text-red-500">
                    Animal não encontrado... <br />
                    Verifique o RGN ou cadastre o animal.
                  </p>
                  <Link
                    href="/cadastro"
                    className="w-full flex flex-row justify-center items-center gap-1 font-medium bg-primary text-white py-2.5 px-4 rounded-lg"
                  >
                    <Plus size={16} color="white" />
                    Cadastrar
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default SearchAnimal;
