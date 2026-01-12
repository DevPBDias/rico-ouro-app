"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReproductionForm } from "./ReproductionForm";
import { useUpdateReproductionEvent } from "@/hooks/db/reproduction_event/useUpdateReproductionEvent";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { useSemenDoses } from "@/hooks/db/doses/useSemenDoses";
import { useUpdateDose } from "@/hooks/db/doses/useUpdateDose";

interface EditReproductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ReproductionEvent;
  onSuccess?: () => void;
}

export function EditReproductionModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EditReproductionModalProps) {
  const { updateEvent, isLoading } = useUpdateReproductionEvent();
  const { doses } = useSemenDoses();
  const { updateQuantity } = useUpdateDose();

  const handleSubmit = async (data: Partial<ReproductionEvent>) => {
    try {
      // 1. Identificar se novos touros foram adicionados ou trocados
      const bullsToCheck: (keyof ReproductionEvent)[] = [
        "bull_name",
        "resync_bull",
        "natural_mating_bull",
      ];

      for (const field of bullsToCheck) {
        const newValue = data[field];
        const oldValue = event[field];

        // Se o valor mudou e não é vazio, subtraímos uma dose
        if (newValue && newValue !== oldValue) {
          const dose = doses.find((d) => d.animal_name === newValue);
          if (dose && dose.quantity > 0) {
            console.log(
              `📉 Edit: Subtraindo 1 dose de ${newValue} (ID: ${dose.id}) pela alteração no campo ${field}`
            );
            await updateQuantity(dose.id, dose.quantity - 1);
          }
        }
      }

      // 2. Atualizar o evento
      await updateEvent(event.event_id, {
        ...data,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold uppercase">
            Editar Evento de Reprodução
          </DialogTitle>
        </DialogHeader>
        <ReproductionForm
          initialData={event}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEdit
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
