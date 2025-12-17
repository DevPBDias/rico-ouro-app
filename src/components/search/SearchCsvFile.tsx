"use client";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CheckCircle2, X, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { Animal } from "@/types/animal.type";
import { checkDuplicateRGNs } from "@/lib/supabase/api";
import { useRxDatabase } from "@/providers/RxDBProvider";
import { extractDataFromExcel } from "@/utils/extractData";
import { useCreateAnimal } from "@/hooks/db/animals/useCreateAnimal";

interface DuplicateInfo {
  rgn: string;
  id: string;
  name: string;
  source: "local" | "global";
}

const SearchCsvFile = () => {
  const { saveAnimal } = useCreateAnimal();
  const db = useRxDatabase();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [totalImported, setTotalImported] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"warning" | "error">(
    "warning"
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const processAnimals = async (animals: Animal[]) => {
    for (const animal of animals) {
      try {
        await saveAnimal(animal);
      } catch (error) {
        console.error(`Erro ao salvar animal ${animal.rgn}:`, error);
      }
    }

    setTotalImported(animals.length);
    setIsProcessing(false);
    setShowSuccessModal(true);
  };

  const checkLocalDuplicates = async (
    rgns: string[]
  ): Promise<DuplicateInfo[]> => {
    if (!db) return [];

    const validRgns = rgns.filter((rgn) => rgn && rgn.trim() !== "");
    if (validRgns.length === 0) return [];

    try {
      const localAnimals = await db.animals
        .find({
          selector: {
            rgn: {
              $in: validRgns,
            },
          },
        })
        .exec();

      const duplicates: DuplicateInfo[] = [];

      localAnimals.forEach((doc: any) => {
        const animal = doc.toJSON();
        if (animal.rgn) {
          duplicates.push({
            rgn: animal.rgn,
            id: animal.rgn,
            name: animal.name || "Sem nome",
            source: "local",
          });
        }
      });

      return duplicates;
    } catch (error) {
      console.error("Erro ao verificar duplicatas locais:", error);
      return [];
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const extractedData: Animal[] = await extractDataFromExcel(selectedFile);

      const rgnsToCheck = extractedData
        .map((animal) => animal.rgn)
        .filter((rgn): rgn is string => !!rgn && rgn.trim() !== "");

      let allDuplicates: DuplicateInfo[] = [];

      if (rgnsToCheck.length > 0) {
        const localDuplicates = await checkLocalDuplicates(rgnsToCheck);

        if (localDuplicates.length > 0) {
          allDuplicates = [...localDuplicates];
        }

        try {
          const globalDuplicates = await checkDuplicateRGNs(rgnsToCheck);

          if (globalDuplicates.length > 0) {
            const localRgns = new Set(localDuplicates.map((d) => d.rgn));
            const uniqueGlobalDuplicates = globalDuplicates
              .filter((d) => !localRgns.has(d.rgn))
              .map((d) => ({
                rgn: d.rgn,
                id: d.id,
                name: d.name,
                source: "global" as const,
              }));

            allDuplicates = [...allDuplicates, ...uniqueGlobalDuplicates];
          }
        } catch (checkError) {
          console.warn(
            "⚠️ Erro na verificação de duplicatas globais, mas verificação local foi realizada:",
            checkError
          );
        }

        if (allDuplicates.length > 0) {
          const duplicateRgns = new Set(allDuplicates.map((d) => d.rgn));

          const nonDuplicateAnimals = extractedData.filter(
            (animal) => !duplicateRgns.has(animal.rgn)
          );

          if (nonDuplicateAnimals.length === 0) {
            setIsProcessing(false);
            setNotificationType("warning");
            setNotificationTitle("Todos os animais já existem");
            setNotificationMessage(
              `Todos os ${extractedData.length} animais da planilha já existem no banco de dados. Nenhum animal foi importado.`
            );
            setShowNotificationModal(true);
            return;
          }

          setDuplicates(allDuplicates);

          await processAnimals(nonDuplicateAnimals);
          return;
        }
      }

      await processAnimals(extractedData);
    } catch (error) {
      setIsProcessing(false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar o arquivo";

      setNotificationType("error");
      setNotificationTitle("Erro ao processar arquivo");
      setNotificationMessage(
        `${errorMessage}\n\nPor favor, verifique se o arquivo está no formato correto e tente novamente.`
      );
      setShowNotificationModal(true);
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
            disabled={!selectedFile || isProcessing}
            className="w-full rounded-lg bg-[#1162AE] py-6 text-sm uppercase font-semibold text-primary-foreground hover:bg-[#1162AE]/90 disabled:opacity-50"
          >
            {isProcessing ? "Processando..." : "Processar arquivo"}
          </Button>
        </div>
      </main>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <Button
              size="icon"
              variant={"ghost"}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
              onClick={() => setShowSuccessModal(false)}
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
                foi procesado com sucesso!
              </p>

              {/* Estatísticas */}
              {totalImported > 0 && (
                <div className="w-full bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    📊 Estatísticas da Importação:
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total importado:
                      </span>
                      <span className="font-medium text-green-600">
                        {totalImported} animais
                      </span>
                    </div>
                    {duplicates.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Duplicados ignorados:
                        </span>
                        <span className="font-medium text-yellow-600">
                          {duplicates.length} animais
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

      {/* Modal de Notificação (Warning/Error) */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <Button
              size="icon"
              variant={"ghost"}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
              onClick={() => setShowNotificationModal(false)}
            >
              <X />
            </Button>

            <div className="flex flex-col items-center space-y-4 text-center">
              {notificationType === "warning" ? (
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}

              <h2
                className={`text-xl font-semibold ${
                  notificationType === "warning"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {notificationTitle}
              </h2>

              <div className="w-full bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-line">
                  {notificationMessage}
                </p>
              </div>

              <Button
                onClick={() => setShowNotificationModal(false)}
                className="mt-4 w-full rounded-lg bg-[#1162AE] py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchCsvFile;
