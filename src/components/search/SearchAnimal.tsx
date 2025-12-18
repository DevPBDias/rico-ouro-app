"use client";

import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animal } from "@/types/animal.type";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import Link from "next/link";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import SearchCard from "../cards/SearchCard";
import DetailsAnimalLayout from "../details-animals/DetailsAnimalLayout";

function SearchAnimal() {
  const { animals } = useAnimals();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSelectedAnimal(null);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(false);
      setSelectedAnimal(null);

      const queryLower = query.toLowerCase().trim();

      const exactMatch = animals.find(
        (animal) => animal.rgn?.toLowerCase() === queryLower
      );

      if (exactMatch) {
        setSearchResults([exactMatch]);
        setIsSearching(false);
        setHasSearched(true);
        return;
      }

      const results = animals.filter((animal) => {
        const rgn = animal.rgn?.toString().toLowerCase() || "";
        const name = animal.name?.toLowerCase() || "";
        const serieRgd = animal.serie_rgd?.toLowerCase() || "";

        return (
          rgn.includes(queryLower) ||
          name.includes(queryLower) ||
          serieRgd.includes(queryLower)
        );
      });

      setSearchResults(results);
      setIsSearching(false);
      setHasSearched(true);
    },
    [animals]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleSelectAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setShowDetails(true);
  };

  const handleBackToSearch = () => {
    setShowDetails(false);
    setSelectedAnimal(null);
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

      {isSearching ? (
        <div className="space-y-3 my-4">
          <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
            Buscando...
          </h2>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonSearchAnimal key={index} />
          ))}
        </div>
      ) : (
        <div className="my-4">
          {searchQuery.trim() && hasSearched && (
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
                        onClick={() => handleSelectAnimal(animal)}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded-lg transition-all active:scale-[0.98]"
                      >
                        <SearchCard
                          animal={animal}
                          onDetailsClick={() => handleSelectAnimal(animal)}
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
