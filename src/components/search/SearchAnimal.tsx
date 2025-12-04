"use client";

import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";
import { Animal } from "@/types/animal.type";
import { AnimalCard } from "../cards/AnimalCard";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import Link from "next/link";
import { useAnimals } from "@/hooks/db/animals/useAnimals";

function SearchAnimal() {
  const { animals } = useAnimals();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

      const results = animals.filter((animal) => {
        const rgn = animal.rgn?.toString().toLowerCase() || "";
        const name = animal.name?.toLowerCase() || "";
        const serieRgd = animal.serie_rgd?.toLowerCase() || "";
        const queryLower = query.toLowerCase();

        return (
          rgn.includes(queryLower) ||
          name.includes(queryLower) ||
          serieRgd.includes(queryLower)
        );
      });

      setSearchResults(results);

      if (results.length === 1) {
        setSelectedAnimal(results[0]);
      }

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
  };

  const handleBackToResults = () => {
    setSelectedAnimal(null);
  };

  return (
    <section className="p-4">
      <div className="my-8">
        <label
          htmlFor="search-animal"
          className="text-xl font-bold text-[#1162AE]"
        >
          Buscar Animal:
        </label>
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-animal"
            type="text"
            className="placeholder:text-sm placeholder:text-gray-400 pl-2 py-2 h-12 bg-white border border-gray-200 rounded-lg text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o RGN, nome ou série do animal..."
          />
        </div>
      </div>

      {isSearching ? (
        <div className="space-y-3 my-12">
          <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
            Buscando...
          </h2>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonSearchAnimal key={index} />
          ))}
        </div>
      ) : (
        <div className="my-6">
          {searchQuery.trim() && hasSearched && (
            <>
              {selectedAnimal ? (
                <div className="space-y-4">
                  {searchResults.length > 1 && (
                    <button
                      onClick={handleBackToResults}
                      className="flex items-center text-[#1162AE] font-medium hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Voltar para resultados ({searchResults.length})
                    </button>
                  )}
                  <AnimalCard type="bois" animal={selectedAnimal} />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
                    Resultados encontrados ({searchResults.length}):
                  </h2>
                  <div className="grid gap-3">
                    {searchResults.map((animal) => (
                      <div
                        key={animal.rgn}
                        onClick={() => handleSelectAnimal(animal)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-[#1162AE] transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-lg text-[#1162AE]">
                            {animal.serie_rgd} {animal.rgn || "N/A"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {animal.name || "Sem nome"}
                          </div>
                          <div className="text-xs uppercase text-gray-500 mt-1">
                            {animal.sex === "M" ? "Macho" : "Fêmea"} •{" "}
                            {animal.farm_id
                              ? `Fazenda ${animal.farm_id}`
                              : "Sem fazenda"}{" "}
                            • {animal.status || "Sem status"}
                          </div>
                        </div>
                        <div className="text-[#1162AE] text-sm font-medium">
                          Ver detalhes
                        </div>
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
