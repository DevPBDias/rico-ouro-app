"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { useSemenDoses } from "@/hooks/db/doses";
import { useCreateDose } from "@/hooks/db/doses";
import { useUpdateDose } from "@/hooks/db/doses";
import { useDeleteDose } from "@/hooks/db/doses";
import { useDoseLocalState } from "@/hooks/doses/useDoseLocalState";
import {
  DosesList,
  SaveBar,
  FilterBottomSheet,
  AddDoseModal,
  EditDoseModal,
  type SortOption,
} from "@/components/doses";
import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";
import { SemenDose } from "@/types/semen_dose.type";

export default function DosesSemenPage() {
  const { doses, isLoading } = useSemenDoses();
  const { createDose } = useCreateDose();
  const { updateDose, updateQuantity } = useUpdateDose();
  const { deleteDose } = useDeleteDose();

  const localState = useDoseLocalState(doses);

  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalDoseId, setEditModalDoseId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const doseToDelete = useMemo(() => {
    if (!deleteConfirmId) return null;
    return localState.displayDoses.find((d) => d.id === deleteConfirmId);
  }, [deleteConfirmId, localState.displayDoses]);

  const doseToEdit = useMemo(() => {
    if (!editModalDoseId) return null;
    return (
      localState.displayDoses.find((d) => d.id === editModalDoseId) || null
    );
  }, [editModalDoseId, localState.displayDoses]);

  const filteredDoses = useMemo(() => {
    let result = [...localState.displayDoses];

    if (selectedBreed) {
      result = result.filter((d) => d.breed === selectedBreed);
    }

    result.sort((a, b) => {
      const nameA = a.animal_name ?? "";
      const nameB = b.animal_name ?? "";
      switch (sortBy) {
        case "name-asc":
          return nameA.localeCompare(nameB);
        case "name-desc":
          return nameB.localeCompare(nameA);
        case "qty-asc":
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        case "qty-desc":
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [localState.displayDoses, selectedBreed, sortBy]);

  const groupedByBreed = useMemo(() => {
    const groups = new Map<string, typeof filteredDoses>();
    for (const dose of filteredDoses) {
      const existing = groups.get(dose.breed) || [];
      groups.set(dose.breed, [...existing, dose]);
    }
    return groups;
  }, [filteredDoses]);

  const breeds = useMemo(() => {
    return [...new Set(doses.map((d) => d.breed))].sort();
  }, [doses]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const changes = localState.getChanges();

      for (const update of changes.updates) {
        await updateDose(update.id, update);
      }

      for (const id of changes.deletions) {
        await deleteDose(id);
      }

      for (const dose of changes.creations) {
        await createDose({
          animal_name: dose.animal_name,
          breed: dose.breed,
          quantity: dose.quantity,
          animal_image: dose.animal_image,
          father_name: dose.father_name,
          maternal_grandfather_name: dose.maternal_grandfather_name,
          iabcz: dose.iabcz,
          registration: dose.registration,
          center_name: dose.center_name,
        });
      }

      localState.clearAfterSave();
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      setSaveError("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      localState.markForDeletion(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleAddDose = (data: {
    animal_name: string;
    breed: string;
    quantity: number;
    animal_image?: string;
    father_name?: string;
    maternal_grandfather_name?: string;
    iabcz?: string;
    registration?: string;
    center_name?: string;
  }) => {
    localState.addLocalDose(data);
  };

  const handleEditDose = (data: Partial<SemenDose>) => {
    if (!editModalDoseId) return;
    localState.updateLocalDose(editModalDoseId, data);
  };

  return (
    <main className="min-h-screen pb-24">
      <Header title="Doses de Sêmen" />

      {saveError && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {saveError}
        </div>
      )}

      <div className="flex justify-between items-center px-4 py-3 border-b bg-white sticky top-0 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFilterSheetOpen(true)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtrar
          {selectedBreed && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded">
              1
            </span>
          )}
        </Button>
        <Button
          type="button"
          onClick={() => setAddModalOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <DosesList
        groupedDoses={groupedByBreed}
        isLoading={isLoading}
        onEdit={(id) => setEditModalDoseId(id)}
        onDelete={(id) => setDeleteConfirmId(id)}
        selectedBreed={selectedBreed}
      />

      {localState.hasChanges && (
        <SaveBar
          onSave={handleSave}
          onCancel={localState.revert}
          isSaving={isSaving}
          changeCount={localState.changeCount}
        />
      )}

      <FilterBottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        breeds={breeds}
        selectedBreed={selectedBreed}
        onBreedSelect={setSelectedBreed}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <AddDoseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddDose}
        existingBreeds={breeds}
      />

      <EditDoseModal
        open={!!editModalDoseId}
        onClose={() => setEditModalDoseId(null)}
        dose={doseToEdit}
        onSave={handleEditDose}
        existingBreeds={breeds}
      />

      <ConfirmActionModal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Animal"
        description={
          doseToDelete
            ? `Tem certeza que deseja remover "${doseToDelete.animal_name}" da lista? Esta ação será aplicada ao salvar.`
            : "Tem certeza que deseja remover este animal?"
        }
      />
    </main>
  );
}
