"use client";

import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Animal } from "@/types/animal.type";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import Link from "next/link";
import { useMatrizes } from "@/hooks/matrizes/useMatrizes";
import SearchCard from "../cards/SearchCard";
import DetailsMatrizLayout from "../details-animals/DetailsMatrizLayout";

function SearchMatriz() {
  const { matrizes } = useMatrizes();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [selectedMatriz, setSelectedMatriz] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSelectedMatriz(null);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(false);
      setSelectedMatriz(null);

      const queryLower = query.toLowerCase().trim();

      const exactMatch = matrizes.find(
        (matriz) => matriz.rgn?.toLowerCase() === queryLower
      );

      if (exactMatch) {
        setSearchResults([exactMatch]);
        setIsSearching(false);
        setHasSearched(true);
        return;
      }

      const results = matrizes.filter((matriz) => {
        const rgn = matriz.rgn?.toString().toLowerCase() || "";
        const name = matriz.name?.toLowerCase() || "";
        const serieRgd = matriz.serie_rgd?.toLowerCase() || "";

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
    [matrizes]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleSelectMatriz = (matriz: Animal) => {
    setSelectedMatriz(matriz);
    setShowDetails(true);
  };

  const handleBackToSearch = () => {
    setShowDetails(false);
    setSelectedMatriz(null);
  };

  if (showDetails && selectedMatriz) {
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
            {selectedMatriz.serie_rgd} {selectedMatriz.rgn}
          </p>
        </div>

        <DetailsMatrizLayout rgn={selectedMatriz.rgn} />
      </section>
    );
  }

  return (
    <section className="px-4">
      <div className="py-3 border-b border-border">
        <label
          htmlFor="search-matriz"
          className="text-base font-bold text-[#1162AE] uppercase"
        >
          Buscar Matriz:
        </label>
        <div className="relative mt-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-matriz"
            type="text"
            className="placeholder:text-sm placeholder:text-gray-400 pl-2 bg-white border border-gray-200 rounded-lg text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o RGN, nome ou série da matriz..."
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
                      ? "Matriz encontrada:"
                      : `Resultados encontrados (${searchResults.length}):`}
                  </h2>
                  {searchResults.length > 1 && (
                    <p className="text-sm text-gray-500 mb-3">
                      Toque em uma matriz para ver os detalhes
                    </p>
                  )}
                  <div className="grid gap-3">
                    {searchResults.map((matriz) => (
                      <div
                        key={matriz.rgn}
                        onClick={() => handleSelectMatriz(matriz)}
                        className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded-lg transition-all active:scale-[0.98]"
                      >
                        <SearchCard
                          animal={matriz}
                          onDetailsClick={() => handleSelectMatriz(matriz)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <p className="text-base text-center font-medium text-red-500">
                    Matriz não encontrada... <br />
                    Verifique o RGN ou cadastre a matriz.
                  </p>
                  <Link
                    href="/matrizes/cadastro"
                    className="w-full flex flex-row justify-center items-center gap-1 font-medium bg-primary text-white py-2.5 px-4 rounded-lg"
                  >
                    <Plus size={16} color="white" />
                    Cadastrar Matriz
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

export default SearchMatriz;
