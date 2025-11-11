"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateAnimalReportPDF } from "@/utils/exportToPdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import {
  ReportOption,
  ReportOptionsForm,
} from "@/components/relatorios/ReportOptionsForm";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";
import { SelectedReportFields } from "@/types";

const REPORT_OPTIONS: ReportOption[] = [
  { key: "nomeAnimal", label: "Nome Animal" },
  { key: "rgn", label: "RGN" },
  { key: "serieRGD", label: "Série RGD" },
  { key: "sexo", label: "Sexo" },
  { key: "dataNascimento", label: "Data Nascimento" },
  { key: "corNascimento", label: "Cor Nascimento" },
  { key: "iabcgz", label: "iABCGz" },
  { key: "deca", label: "DECA" },
  { key: "p", label: "P%" },
  { key: "f", label: "F%" },
  { key: "pesosMedidos", label: "Pesos" },
  { key: "circunferenciaEscrotal", label: "Ce" },
  { key: "status", label: "Status" },
  { key: "farm", label: "Fazenda" },
  { key: "ganhoDiario", label: "GMD" },
  { key: "vacinas", label: "Vacinas" },
  { key: "nomePai", label: "Nome Pai" },
  { key: "maeSerieRGD", label: "Mãe - RGD" },
  { key: "maeRGN", label: "Mãe - RGN" },
];

export default function RelatoriosPage() {
  const router = useRouter();
  const { dados } = useAnimalDB();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "error" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });
  const [selectedItems, setSelectedItems] = useState<SelectedReportFields>({
    nomeAnimal: false,
    rgn: false,
    serieRGD: false,
    sexo: false,
    dataNascimento: false,
    corNascimento: false,
    iabcgz: false,
    deca: false,
    p: false,
    f: false,
    pesosMedidos: false,
    circunferenciaEscrotal: false,
    vacinas: false,
    nomePai: false,
    maeSerieRGD: false,
    maeRGN: false,
    status: false,
    farm: false,
    ganhoDiario: false,
  });

  const handleCheckboxChange = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key as keyof SelectedReportFields],
    }));
  };

  const handleGenerate = () => {
    try {
      if (!dados || dados.length === 0) {
        setModalState({
          isOpen: true,
          title: "Erro",
          message: "Não há dados disponíveis para gerar o relatório",
          type: "error",
        });
        return;
      }

      const hasSelectedFields = Object.values(selectedItems).some(
        (value) => value
      );
      if (!hasSelectedFields) {
        setModalState({
          isOpen: true,
          title: "Atenção",
          message: "Selecione pelo menos um campo para gerar o relatório",
          type: "error",
        });
        return;
      }

      generateAnimalReportPDF(dados, selectedItems);
      setModalState({
        isOpen: true,
        title: "Sucesso",
        message: "Relatório gerado com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setModalState({
        isOpen: true,
        title: "Erro",
        message: "Ocorreu um erro ao gerar o relatório",
        type: "error",
      });
    }
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (modalState.type === "success") {
      router.push("/home");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header title="RELATÓRIO - pdf" />

      <div className="p-6">
        <ReportOptionsForm
          options={REPORT_OPTIONS}
          selectedItems={selectedItems}
          onCheckboxChange={handleCheckboxChange}
        />

        <div className="flex items-center justify-center w-full">
          <Button
            onClick={handleGenerate}
            className="w-1/2 mt-6 bg-primary hover:bg-[#1565C0] text-white font-semibold py-4 text-lg rounded-lg"
          >
            Gerar
          </Button>
        </div>
      </div>

      <Dialog open={modalState.isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalState.type === "error" ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              {modalState.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-700">{modalState.message}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={closeModal}
              variant={modalState.type === "error" ? "destructive" : "default"}
              className="w-full"
            >
              {modalState.type === "error" ? "Fechar" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
