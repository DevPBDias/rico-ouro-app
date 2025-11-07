"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { FormatData } from "@/utils/formatDates";
import { CheckIcon, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useVaccines } from "@/hooks/useVaccines";
import { AddVaccineModal } from "@/components/modals/vaccines/AddVaccineModal";
import { VaccineSuccessModal } from "@/components/modals/vaccines/VaccineSuccessModal";
import { DeleteVaccineModal } from "@/components/modals/vaccines/DeleteVaccineModal";

const VaccinesPage = () => {
  const router = useRouter();
  const { adicionarVacina, dados } = useAnimalDB();
  const {
    vaccines,
    loading,
    error: vaccinesError,
    addVaccine,
    removeVaccine,
  } = useVaccines();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    vacina: "",
    data: "",
  });

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label:
          animal.animal.nome?.trim() ||
          `${animal.animal.serieRGD || ""} ${animal.animal.rgn || ""}`.trim(),
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return rgnOptions;

    return rgnOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rgnOptions, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn || !formData.vacina || !formData.data) {
        setError("Preencha todos os campos");
        return;
      }

      await adicionarVacina(formData.rgn, {
        nome: formData.vacina,
        data: FormatData(formData.data),
      });

      setSuccessModalOpen(true);
    } catch (error) {
      console.error("❌ Erro ao registrar vacina:", error);
      setError("Animal não encontrado ou erro ao registrar vacina");
    }
  };

  const handleCloseModal = () => {
    setSuccessModalOpen(false);
    setFormData({
      rgn: "",
      vacina: "",
      data: "",
    });
    setSearchTerm("");
  };

  const handleCreateVaccine = async (name: string) => {
    await addVaccine(name);
    setFormData((prev) => ({ ...prev, vacina: name }));
  };

  const handleDeleteVaccine = async (id: number) => {
    const vaccineToDelete = vaccines.find((vaccine) => vaccine.id === id);
    await removeVaccine(id);

    if (
      vaccineToDelete &&
      vaccineToDelete.vaccineName.toLowerCase() ===
        formData.vacina.toLowerCase()
    ) {
      setFormData((prev) => ({ ...prev, vacina: "" }));
    }
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
        {vaccinesError && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
            {vaccinesError}
          </div>
        )}
        <div className="flex flex-col justify-start items-start w-full gap-2">
          <label
            htmlFor="vacina"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Vacina:
          </label>
          <div className="flex items-center gap-2 w-full">
            <Select
              value={formData.vacina}
              name="vacina"
              onValueChange={(value) =>
                setFormData({ ...formData, vacina: value })
              }
              disabled={loading}
              required
            >
              <SelectTrigger
                id="vacina"
                name="vacina"
                className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground w-full"
              >
                <SelectValue placeholder="Selecione a vacina" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {loading && (
                    <SelectItem value="__loading" disabled>
                      Carregando vacinas...
                    </SelectItem>
                  )}
                  {!loading && vaccines.length === 0 && (
                    <SelectItem value="__empty" disabled>
                      Nenhuma vacina cadastrada
                    </SelectItem>
                  )}
                  {vaccines.map((vaccine) => (
                    <SelectItem key={vaccine.id} value={vaccine.vaccineName}>
                      {vaccine.vaccineName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap bg-blue-300"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus color="black" size={16} />
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="whitespace-nowrap bg-red-400"
                onClick={() => setDeleteModalOpen(true)}
                disabled={vaccines.length === 0}
              >
                <Trash color="white" size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-2 relative">
          <label
            htmlFor="rgn"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Animal vacinado (RGN):
          </label>
          <Input
            type="text"
            name="rgn"
            id="rgn"
            placeholder="Digite o RGN do animal..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOpen(true);
            }}
            required
            className="w-full bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
            onFocus={() => setOpen(true)}
          />
          {open && filteredOptions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md border shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-muted",
                    formData.rgn === option.value && "bg-muted"
                  )}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, rgn: option.value }));
                    setSearchTerm(option.label);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {formData.rgn === option.value && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          Registrar vacina
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
