"use client";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";
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
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [pendingAnimals, setPendingAnimals] = useState<Animal[]>([]);
  const [totalImported, setTotalImported] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const processAnimals = async (animals: Animal[]) => {
    console.log(`💾 Salvando ${animals.length} animais...`);

    // Salvar animais usando o hook
    for (const animal of animals) {
      try {
        await saveAnimal(animal);
      } catch (error) {
        console.error(`Erro ao salvar animal ${animal.rgn}:`, error);
      }
    }

    console.log("✅ Animais salvos com sucesso!");
    setTotalImported(animals.length);
    setIsProcessing(false);
    setShowSuccessModal(true);
    setPendingAnimals([]);
  };

  // Verificar duplicatas no banco local (RxDB)
  const checkLocalDuplicates = async (
    rgns: string[]
  ): Promise<DuplicateInfo[]> => {
    if (!db) return [];

    const validRgns = rgns.filter((rgn) => rgn && rgn.trim() !== "");
    if (validRgns.length === 0) return [];

    try {
      // Otimização: Buscar apenas os animais que estão na lista de RGNs
      // Usando $in para evitar carregar todos os animais em memória
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
        // Se o animal existe e não está deletado, é uma duplicata
        // Se estiver deletado, tecnicamente podemos recriar/sobrescrever, mas vamos alertar por segurança
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

      // Extrair todos os RGNs dos animais para verificação
      const rgnsToCheck = extractedData
        .map((animal) => animal.rgn)
        .filter((rgn): rgn is string => !!rgn && rgn.trim() !== "");

      console.log(
        `📋 Planilha processada: ${extractedData.length} animais encontrados`
      );

      let allDuplicates: DuplicateInfo[] = [];

      if (rgnsToCheck.length > 0) {
        // 1. Verificar duplicatas no banco LOCAL (RxDB)
        console.log(
          `🔍 Verificando ${rgnsToCheck.length} RGNs no banco local...`
        );
        const localDuplicates = await checkLocalDuplicates(rgnsToCheck);

        if (localDuplicates.length > 0) {
          console.log(
            `⚠️ ${localDuplicates.length} duplicatas encontradas no banco local`
          );
          allDuplicates = [...localDuplicates];
        }

        // 2. Verificar duplicatas no banco GLOBAL (Supabase)
        try {
          console.log(
            `🔍 Verificando ${rgnsToCheck.length} RGNs no banco global...`
          );
          const globalDuplicates = await checkDuplicateRGNs(rgnsToCheck);

          if (globalDuplicates.length > 0) {
            console.log(
              `⚠️ ${globalDuplicates.length} duplicatas encontradas no banco global`
            );

            // Adicionar duplicatas globais que não estão na lista local
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
          // Se a verificação global falhar, continuar apenas com duplicatas locais
          console.warn(
            "⚠️ Erro na verificação de duplicatas globais, mas verificação local foi realizada:",
            checkError
          );
        }

        // Se encontrou duplicatas (locais ou globais), mostrar modal
        if (allDuplicates.length > 0) {
          console.log(
            `⚠️ Total: ${allDuplicates.length} duplicatas encontradas - aguardando decisão do usuário`
          );
          setDuplicates(allDuplicates);
          setPendingAnimals(extractedData);
          setShowDuplicateModal(true);
          setIsProcessing(false);
          return;
        }
      }

      // Não há duplicatas - processar normalmente
      console.log("✅ Nenhuma duplicata encontrada - processando animais...");
      await processAnimals(extractedData);
    } catch (error) {
      setIsProcessing(false);
      console.error("❌ Erro ao processar o arquivo:", error);

      // Mensagem de erro mais específica
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar o arquivo";

      alert(
        `Erro ao processar o arquivo:\n\n${errorMessage}\n\nPor favor, verifique se o arquivo está no formato correto e tente novamente.`
      );
    }
  };

  const handleContinueWithDuplicates = async () => {
    setShowDuplicateModal(false);
    setIsProcessing(true);
    try {
      await processAnimals(pendingAnimals);
    } catch (error) {
      setIsProcessing(false);
      alert("Erro ao processar o arquivo. Tente novamente.");
    }
  };

  const handleCancelImport = () => {
    setShowDuplicateModal(false);
    setPendingAnimals([]);
    setDuplicates([]);
    setIsProcessing(false);
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
                      <span className="font-medium text-blue-600">
                        {totalImported} animais
                      </span>
                    </div>
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

      {/* Modal de RGNs Duplicados */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <Button
              size="icon"
              variant={"ghost"}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
              onClick={handleCancelImport}
            >
              <X />
            </Button>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-12 w-12 text-yellow-600" />
                <h2 className="text-xl font-semibold text-yellow-600">
                  RGNs Duplicados Encontrados
                </h2>
              </div>

              <p className="text-muted-foreground">
                Os seguintes animais já existem no banco de dados:
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {duplicates.map((dup, index) => (
                  <div
                    key={index}
                    className="bg-background rounded p-3 text-sm border border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">RGN: {dup.rgn}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          dup.source === "local"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {dup.source === "local"
                          ? "📱 Banco Local"
                          : "🌐 Banco Global"}
                      </span>
                    </div>
                    <p className="text-muted-foreground">Nome: {dup.name}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Total de duplicados: <strong>{duplicates.length}</strong>
              </p>

              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium">
                  Deseja continuar com a importação?
                </p>
                <p className="text-xs text-muted-foreground">
                  Os animais duplicados serão atualizados com os dados da
                  planilha.
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCancelImport}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleContinueWithDuplicates}
                    className="flex-1 bg-[#1162AE] hover:bg-[#1162AE]/90"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchCsvFile;
