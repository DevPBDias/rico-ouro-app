"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VaccinesMultiSelect } from "@/components/vaccines/VaccinesMultiSelect";
import { RgnAutocomplete } from "@/components/vaccines/RgnAutocomplete";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCreateAnimalVaccine } from "@/hooks/db/animal_vaccines/useCreateAnimalVaccine";
import { AddVaccineModal } from "@/components/modals/vaccines/AddVaccineModal";
import { VaccineSuccessModal } from "@/components/modals/vaccines/VaccineSuccessModal";
import { DeleteVaccineModal } from "@/components/modals/vaccines/DeleteVaccineModal";
import { Plus, Trash } from "lucide-react";
import { useAnimals } from "@/hooks/db/animals/useAnimals";
import { useCreateVaccine } from "@/hooks/db/vaccines/useCreateVaccine";
import { useDeleteVaccine } from "@/hooks/db/vaccines/useDeleteVaccine";
import { useVaccines } from "@/hooks/db/vaccines/useVaccines";

const VaccinesPage = () => {
  const router = useRouter();
  const { animals } = useAnimals();
  const { createVaccine } = useCreateVaccine();
  const { deleteVaccine } = useDeleteVaccine();
  const { createAnimalVaccine } = useCreateAnimalVaccine();
  const { vaccines, isLoading, error: vaccinesError } = useVaccines();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    vacinas: [] as string[],
    data: "",
  });

  const rgnOptions = useMemo(() => {
    return animals
      .map((animal) => ({
        label: animal.rgn || "",
        value: animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [animals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn || formData.vacinas.length === 0 || !formData.data) {
        setError("Preencha todos os campos e selecione pelo menos uma vacina");
        return;
      }

      const animal = animals.find(
        (a) => a.rgn?.toLowerCase() === formData.rgn.toLowerCase()
      );

      if (!animal) {
        setError("Animal não encontrado");
        return;
      }

      // Para cada vacina selecionada, criar um registro em animal_vaccines
      for (const vacinaNome of formData.vacinas) {
        // Encontrar o ID da vacina
        const vaccine = vaccines.find(
          (v) => v.vaccine_name.toLowerCase() === vacinaNome.toLowerCase()
        );

        if (vaccine) {
          await createAnimalVaccine({
            rgn: animal.rgn,
            vaccine_id: vaccine.id,
            date: formData.data,
          });
        }
      }

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Erro ao registrar vacina:", error);
      setError("Erro ao registrar vacina");
    }
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
    setFormData({
      rgn: "",
      vacinas: [],
      data: "",
    });
  };

  const handleCreateVaccine = async (name: string) => {
    try {
      await createVaccine({
        vaccine_name: name,
      });

      setFormData((prev) => ({
        ...prev,
        vacinas: prev.vacinas.includes(name)
          ? prev.vacinas
          : [...prev.vacinas, name],
      }));
    } catch (error) {
      console.error("Erro ao criar vacina:", error);
      setError("Erro ao criar vacina");
    }
  };

  const handleDeleteVaccine = async (id: string) => {
    try {
      const vaccineToDelete = vaccines.find((vaccine) => vaccine.id === id);
      await deleteVaccine(id);

      if (vaccineToDelete) {
        setFormData((prev) => ({
          ...prev,
          vacinas: prev.vacinas.filter(
            (v) =>
              v.toLowerCase() !== vaccineToDelete.vaccine_name.toLowerCase()
          ),
        }));
      }
    } catch (error) {
      console.error("Erro ao deletar vacina:", error);
      setError("Erro ao deletar vacina");
    }
  };

  const toggleVaccine = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      vacinas: checked
        ? [...prev.vacinas, name]
        : prev.vacinas.filter((v) => v !== name),
    }));
  };

  return (
    <main className="min-h-screen">
      <Header title="Vacinação" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-col justify-start items-start w-full gap-2">
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <label
              htmlFor="vacinas"
              className="text-primary font-bold text-sm uppercase w-full text-left"
            >
              Vacinas:
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
                disabled={vaccines.length === 0}
              >
                <Trash color="red" size={16} />
              </Button>
            </div>
          </div>
          <VaccinesMultiSelect
            vaccines={vaccines}
            loading={isLoading}
            selected={formData.vacinas}
            onToggle={toggleVaccine}
          />
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-2 relative">
          <label
            htmlFor="rgn"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Animal vacinado (RGN):
          </label>
          <RgnAutocomplete
            options={rgnOptions}
            value={formData.rgn}
            onSelect={(rgn) => setFormData((prev) => ({ ...prev, rgn }))}
          />
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-2">
          <label
            htmlFor="date"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Data da vacinação:
          </label>
          <Input
            type="date"
            id="date"
            name="date"
            value={formData.data}
            onChange={({ target }) =>
              setFormData({ ...formData, data: target.value })
            }
            className="w-3/5 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
            required
          />
        </div>

        <Button
          variant="default"
          type="submit"
          className="w-full text-sm font-semibold py-5 rounded-lg mt-8 uppercase "
        >
          Registrar vacina(s)
        </Button>
      </form>

      <VaccineSuccessModal
        open={successModalOpen}
        onClose={handleCloseModal}
        onNavigateHome={() => {
          handleCloseModal();
          router.push("/home");
        }}
      />

      <AddVaccineModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleCreateVaccine}
      />

      <DeleteVaccineModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        vaccines={vaccines}
        onDelete={handleDeleteVaccine}
      />
    </main>
  );
};

export default VaccinesPage;
