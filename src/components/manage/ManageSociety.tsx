"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PartnershipSelector } from "@/components/sociedade/PartnershipSelector";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { Animal } from "@/types/animal.type";
import { PartnershipSuccessModal } from "@/components/modals/sociedade/PartnershipSuccessModal";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";

const PARTNERSHIPS = [
  { name: "Alex", initial: "Alex" },
  { name: "Fátima", initial: "Fat" },
  { name: "Jacir", initial: "Jac" },
  { name: "Ricardo", initial: "Ric" },
];

const getPartnershipString = (names: string[]) => {
  return PARTNERSHIPS.filter((p) => names.includes(p.name))
    .map((p) => p.initial)
    .join("/");
};

const getSelectedNames = (str: string | null | undefined) => {
  if (!str) return [];
  const parts = str.split("/");
  return PARTNERSHIPS.filter((p) => parts.includes(p.initial)).map(
    (p) => p.name
  );
};

interface ManageSocietyProps {
  selectedAnimal: Animal | null;
  onSuccess?: () => void;
}

export const ManageSociety = ({ selectedAnimal, onSuccess }: ManageSocietyProps) => {
  const { updateAnimal } = useUpdateAnimal();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAnimal) {
      setSelectedNames(getSelectedNames(selectedAnimal.partnership));
    } else {
      setSelectedNames([]);
    }
  }, [selectedAnimal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    setError(null);

    try {
      const partnershipString = getPartnershipString(selectedNames);
      await updateAnimal(selectedAnimal.rgn, {
        partnership: partnershipString,
      });
      setSuccessModalOpen(true);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao atualizar sociedade:", err);
      setError("Erro ao atualizar sociedade");
    }
  };

  const handleConfirmClear = async () => {
    if (!selectedAnimal) return;
    try {
      await updateAnimal(selectedAnimal.rgn, {
        partnership: "",
      });
      setSelectedNames([]);
      setConfirmModalOpen(false);
    } catch (err) {
      console.error("Erro ao limpar sociedade:", err);
      setError("Erro ao limpar sociedade");
    }
  };

  const togglePartnership = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  };

  if (!selectedAnimal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
        <p className="text-muted-foreground font-medium">Selecione um animal acima para gerenciar sua sociedade.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-2">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-row justify-between items-end gap-4 w-full">
          <div className="p-4 flex-1 rounded-xl bg-primary/5 border border-primary/10 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-primary/60 tracking-wider">Vínculos Atuais:</span>
            <span className="text-lg font-black text-primary uppercase">
              {selectedAnimal.partnership || "Nenhuma"}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirmModalOpen(true)}
            className="px-3 h-auto py-2 text-[10px] font-bold uppercase text-destructive hover:bg-destructive/10 rounded-xl border-2 border-destructive/20 active:scale-95 transition-all"
          >
            Limpar
          </Button>
        </div>

        <PartnershipSelector
          selectedPartnershipNames={selectedNames}
          onToggle={togglePartnership}
        />

        <Button
          variant="default"
          type="submit"
          className="w-full text-base font-bold py-6 rounded-xl mt-4 uppercase shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Confirmar Alteração
        </Button>
      </form>

      <PartnershipSuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />

      <ConfirmActionModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Limpar Sociedade"
        description="Tem certeza que deseja remover todos os vínculos de sociedade deste animal?"
      />
    </div>
  );
};
