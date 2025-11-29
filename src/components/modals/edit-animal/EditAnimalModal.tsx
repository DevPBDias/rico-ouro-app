"use client";

import React, { useState, useEffect } from "react";
import { AnimalData } from "@/types/schemas.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";
import DadosBasicosSection from "./BasicSection";
import DadosGeneticosSection from "./GeneticSection";
import GenealogiaSection from "./PedigreeSection";
import VacinasSection from "./VaccineSection";

interface EditAnimalModalProps {
  open: boolean;
  onClose: () => void;
  data: AnimalData;
  onSave: (updated: AnimalData) => Promise<void>;
}

export function EditAnimalModal({
  open,
  onClose,
  data,
  onSave,
}: EditAnimalModalProps) {
  const [formData, setFormData] = useState<AnimalData>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && data) {
      setFormData(data);
      setError(null);
    }
  }, [data, open]);

  const handleChange = (path: string, value: string) => {
    setFormData((prev) => {
      const keys = path.split(".");

      const updated = structuredClone(prev);

      let current = updated as unknown as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof current[key] !== "object" || current[key] === null) {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.animal.rgn?.trim()) {
      setError("RGN é obrigatório");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedData: AnimalData = {
        ...formData,
        id: data.id,
        animal: {
          ...formData.animal,
          pesosMedidos: data.animal.pesosMedidos ?? [],
          circunferenciaEscrotal: data.animal.circunferenciaEscrotal ?? [],
          ganhoDiario: data.animal.ganhoDiario ?? [],
        },
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedData);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError("Erro ao salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 flex flex-col h-[90vh] overflow-hidden ">
        <DialogHeader className="px-6 py-4 border-b border-[#1162AE]/20 flex-shrink-0">
          <DialogTitle className="text-[#1162AE] uppercase font-bold text-xl flex items-center gap-2">
            Editar Animal
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-6 py-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start gap-2">
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6 pb-8">
              <DadosBasicosSection
                formData={formData}
                handleChange={(e) =>
                  handleChange(e.target.name, e.target.value)
                }
                isSaving={isSaving}
              />

              <DadosGeneticosSection
                formData={formData}
                handleChange={(e) =>
                  handleChange(e.target.name, e.target.value)
                }
                isSaving={isSaving}
              />

              <GenealogiaSection
                formData={formData}
                handleChange={(e) =>
                  handleChange(e.target.name, e.target.value)
                }
                isSaving={isSaving}
              />

              <VacinasSection
                formData={formData}
                setFormData={setFormData}
                isSaving={isSaving}
              />
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#1162AE]/20 bg-gray-50/50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="min-w-[100px] border-gray-300 hover:bg-gray-100 text-sm uppercase"
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary text-white text-sm uppercase min-w-[140px] font-semibold"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Salvando...
                </span>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
