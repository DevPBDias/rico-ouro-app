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
import {
  ReportOption,
  ReportOptionsForm,
} from "@/components/relatorios/ReportOptionsForm";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";
import { SelectedReportFields } from "@/types/report_field.type";
import { useAnimals } from "@/hooks/db/animals/useAnimals";

const REPORT_OPTIONS: ReportOption[] = [
  { key: "name", label: "Nome Animal" },
  { key: "rgn", label: "RGN" },
  { key: "serie_rgd", label: "Série RGD" },
  { key: "sex", label: "Sexo" },
  { key: "born_date", label: "Data Nascimento" },
  { key: "born_color", label: "Cor Nascimento" },
  { key: "iabcgz", label: "iABCGz" },
  { key: "deca", label: "DECA" },
  { key: "p", label: "P%" },
  { key: "f", label: "F%" },
  { key: "status", label: "Status" },
  { key: "farm_name", label: "Fazenda" },
  { key: "father_name", label: "Nome Pai" },
  { key: "mother_serie_rgd", label: "Mãe - RGD" },
  { key: "mother_rgn", label: "Mãe - RGN" },
  { key: "maternal_grandfather_name", label: "Avô Materno" },
];

export default function RelatoriosPage() {
  const router = useRouter();
  const { animals: dados } = useAnimals();
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
    name: false,
    rgn: false,
    serie_rgd: false,
    sex: false,
    born_date: false,
    born_color: false,
    iabcgz: false,
    deca: false,
    p: false,
    f: false,
    animal_metrics_weight: false,
    animal_metrics_ce: false,
    vaccines: false,
    father_name: false,
    mother_serie_rgd: false,
    mother_rgn: false,
    maternal_grandfather_name: false,
    status: false,
    farm_name: false,
    daily_gain: false,
  });

  const handleCheckboxChange = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key as keyof SelectedReportFields],
    }));
  };

  const handleGenerate = async () => {
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

      const result = await generateAnimalReportPDF(dados, selectedItems);

      if (!result) {
        setModalState({
          isOpen: true,
          title: "Erro",
          message: "Não foi possível gerar o relatório",
          type: "error",
        });
        return;
      }

      if (!result.success) {
        // User cancelled
        return;
      }

      // Show appropriate message based on method
      const messages = {
        share: "Relatório compartilhado com sucesso! 📤",
        "save-picker": "Relatório salvo com sucesso! 💾",
        download:
          "Relatório baixado! Verifique a pasta Downloads do seu dispositivo. ⬇️",
      };

      setModalState({
        isOpen: true,
        title: "Sucesso",
        message: messages[result.method],
        type: "success",
      });
    } catch (error) {
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
