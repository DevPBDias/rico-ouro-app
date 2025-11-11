"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { StatusRadioList } from "@/components/status/StatusRadioList";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { StatusSuccessModal } from "@/components/modals/status/StatusSuccessModal";
import type { IStatus } from "@/types/status-type";

const StatusPage = () => {
  const router = useRouter();
  const { atualizarStatus, dados } = useAnimalDB();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    status: null as IStatus | null,
  });

  // Lista de todos os status disponíveis
  const availableStatuses: IStatus[] = [
    "Descarte",
    "RGD",
    "RGN",
    "Vendido",
    "Troca",
    "SRGN",
    "Morte",
  ];

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label: animal.animal.rgn || "",
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  // Quando o RGN é selecionado, carrega o status atual do animal
  useEffect(() => {
    if (formData.rgn) {
      const animal = dados.find(
        (a) => a.animal.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );
      if (animal) {
        setFormData((prev) => ({
          ...prev,
          status: (animal.animal.status as IStatus) || null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        status: null,
      }));
    }
  }, [formData.rgn, dados]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn) {
        setError("Selecione um animal (RGN)");
        return;
      }

      await atualizarStatus(formData.rgn, formData.status);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      setError("Animal não encontrado ou erro ao atualizar status");
    }
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
    setFormData({
      rgn: "",
      status: null,
    });
  };

  const handleSelectStatus = (status: IStatus | null) => {
    setFormData((prev) => ({
      ...prev,
      status,
    }));
  };

  return (
    <main className="min-h-screen">
      <Header title="Status" />
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
          <>
            <div className="flex flex-col justify-start items-start w-full gap-2">
              <label
                htmlFor="status"
                className="text-primary font-bold text-sm uppercase w-full text-left"
              >
                Status:
              </label>
              <StatusRadioList
                statuses={availableStatuses}
                loading={false}
                selected={formData.status}
                onSelect={handleSelectStatus}
              />
            </div>
            <Button
              variant="default"
              type="submit"
              className="w-full text-sm font-semibold py-5 rounded-lg mt-8 uppercase"
            >
              Atualizar status
            </Button>
          </>
        )}
      </form>

      <StatusSuccessModal
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

export default StatusPage;
