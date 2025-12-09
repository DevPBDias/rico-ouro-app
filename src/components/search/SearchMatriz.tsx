"use client";

import { Search, ArrowLeft, Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useState } from "react";
import { Animal } from "@/types/animal.type";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import Link from "next/link";
import { useMatrizes } from "@/hooks/matrizes/useMatrizes";
import SearchCard from "../cards/SearchCard";

function SearchMatriz() {
  const { matrizes } = useMatrizes();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Animal[]>([]);
  const [selectedMatriz, setSelectedMatriz] = useState<Animal | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

      const results = matrizes.filter((matriz) => {
        const rgn = matriz.rgn?.toString().toLowerCase() || "";
        const name = matriz.name?.toLowerCase() || "";
        const serieRgd = matriz.serie_rgd?.toLowerCase() || "";
        const queryLower = query.toLowerCase();

        return (
          rgn.includes(queryLower) ||
          name.includes(queryLower) ||
          serieRgd.includes(queryLower)
        );
      });

      setSearchResults(results);

      if (results.length === 1) {
        setSelectedMatriz(results[0]);
      }

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

  const handleBackToResults = () => {
    setSelectedMatriz(null);
  };

  return (
    <section className="p-4">
      <div className="my-8">
        <label
          htmlFor="search-matriz"
          className="text-xl font-bold text-[#1162AE]"
        >
          Buscar Matriz:
        </label>
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="search-matriz"
            type="text"
            className="placeholder:text-sm placeholder:text-gray-400 pl-2 py-2 h-12 bg-white border border-gray-200 rounded-lg text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o RGN, nome ou série da matriz..."
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
              {selectedMatriz ? (
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
                  <SearchCard animal={selectedMatriz} />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
                    Resultados encontrados ({searchResults.length}):
                  </h2>
                  <div className="grid gap-3">
                    {searchResults.map((matriz) => (
                      <SearchCard key={matriz.rgn} animal={matriz} />
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
