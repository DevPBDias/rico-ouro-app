"use client";

import { Search } from "lucide-react";
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
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(false);

      const results = dados.filter((animal) => {
        const rgn = animal.animal.rgn?.toString().toLowerCase() || "";
        const queryLower = query.toLowerCase();

        return rgn.includes(queryLower);
      });

      setSearchResults(results);
      setIsSearching(false);
      setHasSearched(true);
    },
    [dados]
  );

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
          RGN:
        </label>
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-animal"
            type="text"
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
          {searchQuery.trim() && hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
                    Animal encontrado:
                  </h2>
                  {searchResults.map((animal) => (
                    <div key={animal.id} className="cursor-pointer">
                      <AnimalCard animal={animal} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-base font-semibold text-red-500">
                    Animal não encontrado... <br />
                    Verifique o RGN e tente novamente.
                  </p>
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
