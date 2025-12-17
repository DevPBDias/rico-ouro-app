"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { PartnershipSelector } from "@/components/sociedade/PartnershipSelector";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { PartnershipSuccessModal } from "@/components/modals/sociedade/PartnershipSuccessModal";

const PARTNERSHIPS = [
  { name: "Alex", initial: "A" },
  { name: "Fátima", initial: "F" },
  { name: "Jacir", initial: "J" },
];

const getPartnershipString = (names: string[]) => {
  let result = "R";
  PARTNERSHIPS.forEach((p) => {
    if (names.includes(p.name)) {
      result += "/" + p.initial;
    }
  });
  return result;
};

const getSelectedNames = (str: string | null | undefined) => {
  if (!str) return [];
  const parts = str.split("/");
  return PARTNERSHIPS.filter((p) => parts.includes(p.initial)).map(
    (p) => p.name
  );
};

const PartnershipPage = () => {
  const router = useRouter();
  const { animals } = useAnimals();
  const { updateAnimal } = useUpdateAnimal();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    partnership: [] as string[],
  });

  const selectedAnimal = useMemo(() => {
    if (!formData.rgn) return null;
    return animals.find(
      (a) => a.rgn?.toLowerCase() === formData.rgn.toLowerCase()
    );
  }, [formData.rgn, animals]);

  const rgnOptions = useMemo(() => {
    return animals
      .map((animal) => ({
        label: animal.rgn || "",
        value: animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [animals]);

  useEffect(() => {
    if (selectedAnimal) {
      setFormData((prev) => ({
        ...prev,
        partnership: getSelectedNames(selectedAnimal.partnership),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        partnership: [],
      }));
    }
  }, [selectedAnimal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn) {
        setError("Selecione um animal (RGN)");
        return;
      }

      if (!selectedAnimal) {
        setError("Animal não encontrado");
        return;
      }

      const partnershipString = getPartnershipString(formData.partnership);

      await updateAnimal(selectedAnimal.rgn, {
        partnership: partnershipString,
      });

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao atualizar sociedade:", error);
      setError("Erro ao atualizar sociedade");
    }
  };

  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      partnership: [],
    }));
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
    setFormData({
      rgn: "",
      partnership: [],
    });
  };

  const togglePartnership = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      partnership: prev.partnership.includes(name)
        ? prev.partnership.filter((n) => n !== name)
        : [...prev.partnership, name],
    }));
  };

  return (
    <main className="min-h-screen">
      <Header title="Sociedades" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col justify-start items-start w-full gap-2 relative">
          <label
            htmlFor="rgn"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Animal (RGN):
          </label>
          <RgnAutocomplete
            options={rgnOptions}
            value={formData.rgn}
            onSelect={(rgn) => setFormData((prev) => ({ ...prev, rgn }))}
          />
        </div>

        {formData.rgn && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {selectedAnimal && (
              <div className="flex flex-row justify-between items-end gap-4 w-full">
                <div className="p-4 flex-1 rounded-xl bg-primary/5 border border-primary/10 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-primary/60">
                    Sociedade Atual:
                  </span>
                  <span className="text-lg font-black text-primary Capitalize">
                    {selectedAnimal.partnership || "Nenhuma"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  className="px-2 text-[11px] font-medium uppercase text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20"
                >
                  Limpar Seleção
                </Button>
              </div>
            )}

            <PartnershipSelector
              selectedPartnershipNames={formData.partnership}
              onToggle={togglePartnership}
            />

            <Button
              variant="default"
              type="submit"
              className="w-full text-sm font-semibold py-5 rounded-lg mt-4 uppercase shadow-lg shadow-primary/20"
            >
              Confirmar Alteração
            </Button>
          </div>
        )}
      </form>

      <PartnershipSuccessModal
        open={successModalOpen}
        onClose={handleCloseModal}
        onNavigateHome={() => {
          handleCloseModal();
          router.push("/home");
        }}
      />
    </main>
  );
};

export default PartnershipPage;
