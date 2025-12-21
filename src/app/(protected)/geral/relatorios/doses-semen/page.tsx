"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { generateDoseReportPDF } from "@/utils/exportDoseToPdf";
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
import {
  AlertCircle,
  CheckCircle,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";
import { SelectedDoseReportFields } from "@/types/dose_report_field.type";
import { useSemenDoses } from "@/hooks/db/doses";

const DOSE_REPORT_OPTIONS_GROUPED: {
  category: string;
  options: ReportOption[];
}[] = [
  {
    category: "Animal",
    options: [
      { key: "animal_name", label: "Nome" },
      { key: "breed", label: "Raça" },
      { key: "father_name", label: "Nome Pai" },
      { key: "maternal_grandfather_name", label: "Avô Materno" },
    ],
  },
  {
    category: "Dados",
    options: [
      { key: "quantity", label: "Quantidade" },
      { key: "iabcz", label: "iABCZ" },
      { key: "registration", label: "Registro" },
      { key: "center_name", label: "Central" },
    ],
  },
];

const ALL_DOSE_REPORT_OPTIONS: ReportOption[] =
  DOSE_REPORT_OPTIONS_GROUPED.flatMap((group) => group.options);

export default function DosesSemenReportPage() {
  const router = useRouter();
  const { doses: dados } = useSemenDoses();
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
  const [selectedItems, setSelectedItems] = useState<SelectedDoseReportFields>({
    animal_name: false,
    breed: false,
    quantity: false,
    father_name: false,
    maternal_grandfather_name: false,
    iabcz: false,
    registration: false,
    center_name: false,
  });

  const handleCheckboxChange = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key as keyof SelectedDoseReportFields],
    }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const totalFields = ALL_DOSE_REPORT_OPTIONS.length;

  const handleSelectAll = () => {
    const allSelected: SelectedDoseReportFields =
      {} as SelectedDoseReportFields;
    ALL_DOSE_REPORT_OPTIONS.forEach((option) => {
      allSelected[option.key as keyof SelectedDoseReportFields] = true;
    });
    setSelectedItems(allSelected);
  };

  const handleDeselectAll = () => {
    const allDeselected: SelectedDoseReportFields =
      {} as SelectedDoseReportFields;
    ALL_DOSE_REPORT_OPTIONS.forEach((option) => {
      allDeselected[option.key as keyof SelectedDoseReportFields] = false;
    });
    setSelectedItems(allDeselected);
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

      const result = await generateDoseReportPDF(dados, selectedItems);

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
        return;
      }

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header title="Relatório de Doses" />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Card de informações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex flex-col items-start justify-start gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Campos Selecionados
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedCount} de {totalFields} campos selecionados
                </p>
              </div>
            </div>
            <div className="flex flex-row items-end justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
                disabled={selectedCount === totalFields}
              >
                <CheckSquare className="h-4 w-4" />
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="gap-2"
                disabled={selectedCount === 0}
              >
                <Square className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
          {selectedCount === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              ⚠️ Selecione pelo menos um campo para gerar o relatório
            </div>
          )}
        </div>

        {/* Formulário agrupado */}
        <div className="grid grid-cols-2 gap-2">
          {DOSE_REPORT_OPTIONS_GROUPED.map((group) => (
            <div
              key={group.category}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-2"
            >
              <h3 className="font-semibold text-primary text-lg mb-4 pb-2 border-b border-primary/20">
                {group.category}
              </h3>
              <ReportOptionsForm
                options={group.options}
                selectedItems={
                  selectedItems as unknown as Record<string, boolean>
                }
                onCheckboxChange={handleCheckboxChange}
              />
            </div>
          ))}
        </div>

        {/* Botão de gerar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-8 shadow-lg">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-primary">
                {selectedCount}
              </span>{" "}
              campo
              {selectedCount !== 1 ? "s" : ""} selecionado
              {selectedCount !== 1 ? "s" : ""}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={selectedCount === 0 || !dados || dados.length === 0}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-base rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-5 w-5" />
              Gerar Relatório PDF
            </Button>
          </div>
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
