"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { FarmsCheckboxList } from "@/components/farms/FarmsCheckboxList";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useFarms } from "@/hooks/useFarms";
import { AddFarmModal } from "@/components/modals/farm/AddFarmModal";
import { FarmSuccessModal } from "@/components/modals/farm/FarmSuccessModal";
import { DeleteFarmModal } from "@/components/modals/farm/DeleteFarmModal";
import { Plus, Trash } from "lucide-react";

const FarmsPage = () => {
  const router = useRouter();
  const { atualizarFazenda, dados } = useAnimalDB();
  const { farms, loading, error: farmsError, addFarm, removeFarm } = useFarms();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    farm: null as string | null,
  });

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label: animal.animal.rgn || "",
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  // Quando o RGN é selecionado, carrega a fazenda atual do animal
  useEffect(() => {
    if (formData.rgn) {
      const animal = dados.find(
        (a) => a.animal.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );
      if (animal) {
        setFormData((prev) => ({
          ...prev,
          farm: animal.animal.farm || null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        farm: null,
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

      await atualizarFazenda(formData.rgn, formData.farm);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("❌ Erro ao atualizar fazenda:", error);
      setError("Animal não encontrado ou erro ao atualizar fazenda");
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
    await addFarm(name);
    setFormData((prev) => ({
      ...prev,
      farm: prev.farm || name,
    }));
  };

  const handleDeleteFarm = async (id: number) => {
    const farmToDelete = farms.find((farm) => farm.id === id);
    await removeFarm(id);

    if (
      farmToDelete &&
      formData.farm?.toLowerCase() === farmToDelete.farmName.toLowerCase()
    ) {
      setFormData((prev) => ({
        ...prev,
        farm: null,
      }));
    }
  };

  const toggleFarm = (name: string | null) => {
    setFormData((prev) => ({
      ...prev,
      farm: name,
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
            {farmsError}
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
              <div className="flex flex-row justify-between items-center w-full gap-2">
                <label
                  htmlFor="fazendas"
                  className="text-primary font-bold text-sm uppercase w-full text-left"
                >
                  Fazendas:
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddModalOpen(true)}
                  >
                    <Plus color="blue" size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={farms.length === 0}
                  >
                    <Trash color="red" size={16} />
                  </Button>
                </div>
              </div>
              <FarmsCheckboxList
                farms={farms}
                loading={loading}
                selected={formData.farm}
                onToggle={toggleFarm}
              />
            </div>
            <Button
              variant="default"
              type="submit"
              className="w-full text-sm font-semibold py-5 rounded-lg mt-8 uppercase "
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
