"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { AnimalSelector } from "@/components/farms/AnimalSelector";
import { FarmSelector } from "@/components/farms/FarmSelector";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useUpdateAnimal } from "@/hooks/db/animals/useUpdateAnimal";
import { useFarms } from "@/hooks/db/farms/useFarms";
import { useCreateFarm } from "@/hooks/db/farms/useCreateFarm";
import { useDeleteFarm } from "@/hooks/db/farms/useDeleteFarm";
import { AddFarmModal } from "@/components/modals/farm/AddFarmModal";
import { FarmSuccessModal } from "@/components/modals/farm/FarmSuccessModal";
import { DeleteFarmModal } from "@/components/modals/farm/DeleteFarmModal";

const FarmsPage = () => {
  const router = useRouter();
  const { animals } = useAnimals();
  const { updateAnimal } = useUpdateAnimal();
  const { farms, isLoading: loading, error: farmsError } = useFarms();
  const { createFarm } = useCreateFarm();
  const { deleteFarm } = useDeleteFarm();

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    farm: null as string | null,
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
          farm: animal.farm_id || null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        farm: null,
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
        farm_id: formData.farm || undefined,
      });

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao atualizar fazenda:", error);
      setError("Erro ao atualizar fazenda");
    }
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
    setFormData({
      rgn: "",
      farm: null,
    });
  };

  const handleCreateFarm = async (name: string) => {
    try {
      await createFarm({ farm_name: name });
    } catch (error) {
      console.error("Erro ao criar fazenda:", error);
      setError("Erro ao criar fazenda");
    }
  };

  const handleDeleteFarm = async (id: string) => {
    try {
      await deleteFarm(id);

      if (formData.farm === id) {
        setFormData((prev) => ({
          ...prev,
          farm: null,
        }));
      }
    } catch (error) {
      console.error("Erro ao deletar fazenda:", error);
      setError("Erro ao deletar fazenda");
    }
  };

  const toggleFarm = (farmId: string | null) => {
    setFormData((prev) => ({
      ...prev,
      farm: farmId,
    }));
  };

  return (
    <main className="min-h-screen">
      <Header title="Fazendas" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {farmsError && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
            {farmsError.message}
          </div>
        )}

        <AnimalSelector
          rgnOptions={rgnOptions}
          selectedRgn={formData.rgn}
          onSelect={(rgn) => setFormData((prev) => ({ ...prev, rgn }))}
        />

        {formData.rgn && (
          <>
            <FarmSelector
              farms={farms}
              loading={loading}
              selectedFarmId={formData.farm}
              onToggle={toggleFarm}
              onAddClick={() => setAddModalOpen(true)}
              onDeleteClick={() => setDeleteModalOpen(true)}
            />
            <Button
              variant="default"
              type="submit"
              className="w-full text-sm font-semibold py-5 rounded-lg mt-8 uppercase"
            >
              Atualizar fazenda
            </Button>
          </>
        )}
      </form>

      <FarmSuccessModal
        open={successModalOpen}
        onClose={handleCloseModal}
        onNavigateHome={() => {
          handleCloseModal();
          router.push("/home");
        }}
      />

      <AddFarmModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleCreateFarm}
      />

      <DeleteFarmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        farms={farms}
        onDelete={handleDeleteFarm}
      />
    </main>
  );
};

export default FarmsPage;
