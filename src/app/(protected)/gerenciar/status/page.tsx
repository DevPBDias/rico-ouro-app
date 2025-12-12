"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { StatusSuccessModal } from "@/components/modals/status/StatusSuccessModal";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import {
  useStatuses,
  useCreateStatus,
  useDeleteStatus,
} from "@/hooks/db/statuses";
import { StatusSelector } from "@/components/status/StatusSelector";
import { AddStatusModal } from "@/components/modals/status/AddStatusModal";
import { DeleteStatusModal } from "@/components/modals/status/DeleteStatusModal";

const StatusPage = () => {
  const router = useRouter();
  const { animals } = useAnimals();
  const { updateAnimal } = useUpdateAnimal();
  const { statuses, isLoading: statusesLoading } = useStatuses();
  const { createStatus } = useCreateStatus();
  const { deleteStatus } = useDeleteStatus();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    status: null as string | null,
  });

  const rgnOptions = useMemo(() => {
    return animals
      .map((animal) => ({
        label: animal.rgn || "",
        value: animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [animals]);

  useEffect(() => {
    if (formData.rgn) {
      const animal = animals.find(
        (a) => a.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );
      if (animal) {
        setFormData((prev) => ({
          ...prev,
          status: animal.status || null,
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
        (a) => a.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );

      if (!animalToUpdate) {
        setError("Animal não encontrado");
        return;
      }

      await updateAnimal(animalToUpdate.rgn, {
        status: formData.status || "-",
      });

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
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

  const handleCreateStatus = async (name: string) => {
    try {
      await createStatus({ status_name: name });
    } catch (error) {
      console.error("Erro ao criar status:", error);
      setError("Erro ao criar status");
    }
  };

  const handleDeleteStatus = async (id: string) => {
    try {
      await deleteStatus(id);

      // If the deleted status was selected, clear it
      const status = statuses.find((s) => s.id === id);
      if (status && formData.status === status.status_name) {
        setFormData((prev) => ({
          ...prev,
          status: null,
        }));
      }
    } catch (error) {
      console.error("Erro ao deletar status:", error);
      setError("Erro ao deletar status");
    }
  };

  const toggleStatus = (statusName: string | null) => {
    setFormData((prev) => ({
      ...prev,
      status: statusName,
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
            <StatusSelector
              statuses={statuses}
              loading={statusesLoading}
              selectedStatusName={formData.status}
              onToggle={toggleStatus}
              onAddClick={() => setAddModalOpen(true)}
              onDeleteClick={() => setDeleteModalOpen(true)}
            />
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

      <AddStatusModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleCreateStatus}
      />

      <DeleteStatusModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        statuses={statuses}
        onDelete={handleDeleteStatus}
      />
    </main>
  );
};

export default StatusPage;
