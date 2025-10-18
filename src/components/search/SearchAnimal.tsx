"use client";

import { AlertCircle, Search } from "lucide-react";
import { Input } from "../ui/input";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { useCallback, useEffect, useState } from "react";
import { AnimalData } from "@/lib/db";
import { AnimalCard } from "../cards/AnimalCard";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";

function SearchAnimal() {
  const { dados } = useAnimalDB();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimalData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      // Busca por RGN exato ou parcial
      const results = dados.filter((animal) => {
        const rgn = animal.animal.rgn?.toString().toLowerCase() || "";
        const serieRGD = animal.animal.serieRGD?.toString().toLowerCase() || "";
        const queryLower = query.toLowerCase();

        return rgn.includes(queryLower) || serieRGD.includes(queryLower);
      });

      setSearchResults(results);
      setIsSearching(false);
    },
    [dados]
  );

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dados, handleSearch]);

  return (
    <section className="p-4">
      <div className="my-8">
        <label
          htmlFor="search-animal"
          className="text-xl font-bold text-[#1162AE]"
        >
          Filtrar por RGN:
        </label>
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-animal"
            type="text"
            placeholder="Buscar por RGN ou Série/RGD..."
            className="pl-2 py-2 h-12 bg-white border border-gray-200 rounded-lg text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {isSearching ? (
        <div className="space-y-3 my-12">
          <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
            Resultados da busca:
          </h2>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonSearchAnimal key={index} />
          ))}
        </div>
      ) : (
        <div className="my-12">
          <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
            Resultados da busca:
          </h2>
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((animal) => (
                <div key={animal.id} className="cursor-pointer">
                  <AnimalCard animal={animal} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex pt-2 text-gray-500 text-base">
              <AlertCircle className="w-5 h-5 mr-2" />
              Nenhum animal encontrado
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default SearchAnimal;
