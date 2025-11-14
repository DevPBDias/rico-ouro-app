"use client";
import React, { useCallback, useEffect, useState } from "react";
import SkeletonSearchAnimal from "../skeletons/SkeletonSearchAnimal";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { MatrizCard } from "../cards/MatrizCard";
import useMatrizDB, { MatrizItem } from "@/hooks/useMatrizDB";
import Link from "next/link";

const SearchMatriz = () => {
  const { dados } = useMatrizDB();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MatrizItem[]>([]);
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
        const rgn = animal.matriz.rgn?.toString().toLowerCase() || "";
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
        <div className="my-6">
          {searchQuery.trim() && hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-[#1162AE] mb-4">
                    Matriz encontrada:
                  </h2>
                  {searchResults.map((animal) => (
                    <div key={animal.matriz.rgn} className="cursor-pointer">
                      <MatrizCard data={animal} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-base font-semibold text-red-500">
                    Matriz não encontrada...
                  </p>
                  <Link
                    href="/matrizes/cadastro"
                    className="mt-4 inline-block bg-primary w-full text-white px-6 py-2.5 text-sm rounded-lg uppercase font-semibold"
                  >
                    + Cadastrar Matriz
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchMatriz;
