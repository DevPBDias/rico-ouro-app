"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimalCard } from "@/components/cards/AnimalCard";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { useRecentAnimals } from "@/hooks/useRecentAnimals";
import { exportToExcel } from "@/utils/exportData";
import { AnimalData } from "@/lib/db";

export default function HomePage() {
  const router = useRouter();
  const { dados } = useAnimalDB();
  const { recentAnimals, addRecentAnimal } = useRecentAnimals();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AnimalData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Função de busca por RGN
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Busca por RGN exato ou parcial
    const results = dados.filter(animal => {
      const rgn = animal.animal.rgn?.toString().toLowerCase() || "";
      const serieRGD = animal.animal.serieRGD?.toString().toLowerCase() || "";
      const queryLower = query.toLowerCase();
      
      return rgn.includes(queryLower) || serieRGD.includes(queryLower);
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  // Função para selecionar um animal da busca
  const selectAnimal = (animal: AnimalData) => {
    addRecentAnimal(animal);
    router.push(`/bois/${animal.id}`);
  };

  // Função para exportar planilha
  const handleExport = () => {
    if (dados.length === 0) {
      alert("Não há dados para exportar!");
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `animais_${timestamp}.xlsx`;
    exportToExcel(dados, filename);
  };

  // Função para ir para upload
  const handleImport = () => {
    router.push("/upload");
  };

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dados]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header com busca */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Rico Ouro App</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Buscar por RGN ou Série/RGD..." 
            className="pl-10 py-3 bg-white border border-gray-200 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Resultados da busca */}
      {searchQuery && (
        <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Resultados da busca {isSearching && "(buscando...)"}
          </h2>
          
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((animal) => (
                <div 
                  key={animal.id}
                  onClick={() => selectAnimal(animal)}
                  className="cursor-pointer"
                >
                  <AnimalCard animal={animal} />
                </div>
              ))}
            </div>
          ) : !isSearching ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              Nenhum animal encontrado
            </div>
          ) : null}
        </div>
      )}

      {/* Últimos animais pesquisados */}
      {!searchQuery && recentAnimals.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Últimos animais pesquisados</h2>
          <div className="space-y-3">
            {recentAnimals.map((animal) => (
              <div 
                key={animal.id}
                onClick={() => selectAnimal(animal)}
                className="cursor-pointer"
              >
                <AnimalCard animal={animal} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há animais recentes */}
      {!searchQuery && recentAnimals.length === 0 && (
        <div className="px-4 pb-4">
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Use a busca acima para encontrar animais</p>
            <p className="text-sm">Os últimos 5 animais pesquisados aparecerão aqui</p>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="px-4 space-y-3 pb-20">
        <Button 
          onClick={handleImport}
          className="w-full bg-white hover:bg-gray-50 text-blue-900 border border-blue-900 py-3 rounded-lg font-medium"
        >
          Importar planilha
        </Button>

        <Button 
          onClick={handleExport}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-medium"
          disabled={dados.length === 0}
        >
          Exportar planilha ({dados.length} registros)
        </Button>
      </div>
    </main>
  );
}
