"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { StatusRadioList } from "@/components/status/StatusRadioList";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { StatusSuccessModal } from "@/components/modals/status/StatusSuccessModal";
import type { IStatus } from "@/types/status-type";
import { useAnimals, useUpdateAnimal } from "@/hooks/db";

const StatusPage = () => {
  const router = useRouter();
  const { animals } = useAnimals();
  const { updateAnimal } = useUpdateAnimal();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    status: null as IStatus | null,
  });

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
    return animals
      .map((animal) => ({
        label: animal.animal.rgn || "",
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [animals]);

  useEffect(() => {
    if (formData.rgn) {
      const animal = animals.find(
        (a) => a.animal.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );
      if (animal) {
        const currentStatus = animal.animal.status;
        let statusValue: IStatus | null = null;

        if (typeof currentStatus === "string") {
          statusValue = currentStatus as IStatus;
        } else if (
          currentStatus &&
          typeof currentStatus === "object" &&
          "value" in currentStatus
        ) {
          statusValue = (currentStatus as any).value as IStatus;
        }

        setFormData((prev) => ({
          ...prev,
          status: statusValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        status: null,
      }));
    }
  }, [formData.rgn, animals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn) {
        setError("Selecione um animal (RGN)");
        return;
      }

      const animalToUpdate = animals.find(
        (a) => a.animal.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );

      if (!animalToUpdate || !animalToUpdate.uuid) {
        setError("Animal não encontrado");
        return;
      }

      await updateAnimal(animalToUpdate.uuid, {
        animal: {
          ...animalToUpdate.animal,
          status: formData.status
            ? { label: formData.status, value: formData.status }
            : undefined,
        },
      });

      setSuccessModalOpen(true);
    } catch (error) {
      setError("Erro ao atualizar status");
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
