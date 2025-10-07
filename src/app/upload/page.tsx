"use client";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { AnimalData } from "@/lib/db";
import { extractDataFromExcel } from "@/utils/extractData";
import { useState } from "react";

export default function UploadPage() {
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
    <div className="p-4">
      <h1 className="text-xl font-bold">Upload Planilha</h1>

      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      <button
        onClick={handleProcessar}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Processar
      </button>

      <button
        onClick={limpar}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Limpar todos
      </button>

      <h2 className="mt-4 font-semibold">📂 Dados salvos:</h2>
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
        {JSON.stringify(dados, null, 2)}
      </pre>
    </div>
  );
}
