"use client";
import { useAnimalActions } from "@/hooks/useRxData";
import { extractDataFromExcel } from "@/utils/extractData";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { AnimalData } from "@/types/schemas.types";

const SearchCsvFile = () => {
  const { bulkUpsert, isReady } = useAnimalActions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const extractedData: AnimalData[] = await extractDataFromExcel(
        selectedFile
      );

      const animalsToSave = extractedData.map((animal) => ({
        ...animal,
        uuid: animal.uuid || crypto.randomUUID(),
      }));

      await bulkUpsert(animalsToSave);

      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (error) {
      setIsProcessing(false);
      alert("Erro ao processar o arquivo. Tente novamente.");
    }
  };

  return (
    <section className="p-4">
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-base text-primary uppercase font-bold">
              Importar arquivo:
            </label>

            <div className="rounded-lg bg-muted px-4 py-3 mt-2">
              <p className="text-sm italic text-muted-foreground">
                {selectedFile
                  ? selectedFile.name
                  : "Nenhum arquivo selecionado"}
              </p>
            </div>

            <Button
              onClick={handleChooseFile}
              className="w-full rounded-lg uppercase bg-[#1162AE] py-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Escolher arquivo
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Selecionar arquivo CSV"
            />
          </div>

          <div className="border-t-1 border-[#1162AE]" />

          <Button
            onClick={handleProcessFile}
            disabled={!selectedFile || isProcessing || !isReady}
            className="w-full rounded-lg bg-[#1162AE] py-6 text-sm uppercase font-semibold text-primary-foreground hover:bg-[#1162AE]/90 disabled:opacity-50"
          >
            {isProcessing ? "Processando..." : "Processar arquivo"}
          </Button>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <Button
              size="icon"
              variant={"ghost"}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
            >
              <X />
            </Button>

            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h2 className="text-xl font-semibold text-[#1162AE]">
                Processamento Concluído
              </h2>
              <p className="text-muted-foreground">
                O arquivo{" "}
                <span className="font-medium text-foreground">
                  {selectedFile?.name}
                </span>{" "}
                foi processado com sucesso!
              </p>
              <Link
                href="/home"
                className="mt-4 w-full rounded-lg bg-[#1162AE] py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ir para a página inicial
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchCsvFile;
