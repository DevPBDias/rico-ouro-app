"use client";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { AnimalData } from "@/lib/db";
import { extractDataFromExcel } from "@/utils/extractData";
import { useState } from "react";
import { Input } from "../ui/input";

const SearchCsvFile = () => {
  const { dados, salvarOuAtualizar, limpar } = useAnimalDB();
  const [arquivo, setArquivo] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleProcessar = async () => {
    if (!arquivo) return;

    const extractedData: AnimalData[] = await extractDataFromExcel(arquivo);
    await salvarOuAtualizar(extractedData);
  };

  return (
    <section className="p-4">
      <div className="my-8">
        <label
          htmlFor="search-file"
          className="text-xl font-bold text-[#1162AE]"
        >
          Importar arquivo:
        </label>
        <div className="relative mt-4">
          <Input
            id="search-file"
            type="file"
            className="py-2 h-12 cursor-pointer"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
          />
        </div>
        <button
          onClick={handleProcessar}
          className="mt-6 w-full rounded-lg px-4 py-2 bg-[#1162AE] text-white font-medium hover:bg-[#1162AE]/95 transition-colors cursor-pointer"
        >
          Processar dados
        </button>
      </div>

      <div className="">
        <h2 className="text-xl font-bold text-[#1162AE]">Dados salvos:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96 mt-4">
          {JSON.stringify(dados, null, 2)}
        </pre>
        <button
          onClick={limpar}
          className="mt-6 w-full px-4 py-2 rounded-lg bg-red-700 text-white font-medium cursor-pointer"
        >
          Limpar dados
        </button>
      </div>
    </section>
  );
};

export default SearchCsvFile;
