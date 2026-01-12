"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReproductionForm } from "./ReproductionForm";
import { useCreateReproductionEvent } from "@/hooks/db/reproduction_event/useCreateReproductionEvent";
import { ReproductionEvent } from "@/types/reproduction_event.type";
import { useSemenDoses } from "@/hooks/db/doses/useSemenDoses";
import { useUpdateDose } from "@/hooks/db/doses/useUpdateDose";

interface CreateReproductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rgn: string;
  onSuccess?: () => void;
}

export function CreateReproductionModal({
  isOpen,
  onClose,
  rgn,
  onSuccess,
}: CreateReproductionModalProps) {
  const { createEvent, isLoading } = useCreateReproductionEvent();
  const { doses } = useSemenDoses();
  const { updateQuantity } = useUpdateDose();

  const handleSubmit = async (data: Partial<ReproductionEvent>) => {
    try {
      // 1. Criar o evento
      await createEvent({
        ...data,
        rgn,
        _deleted: false,
      });

      // 2. Subtrair doses do estoque (Touro D0 e Resync)
      const bullsToSubtract = [data.bull_name, data.resync_bull].filter(
        Boolean
      );

      for (const bullName of bullsToSubtract) {
        const dose = doses.find((d) => d.animal_name === bullName);
        if (dose && dose.quantity > 0) {
          console.log(`📉 Subtraindo 1 dose de ${bullName} (ID: ${dose.id})`);
          await updateQuantity(dose.id, dose.quantity - 1);
        }
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold uppercase">
            Novo Evento de Reprodução
          </DialogTitle>
        </DialogHeader>
        <ReproductionForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onClose}
          initialData={{ rgn }}
        />
      </DialogContent>
    </Dialog>
  );
}
