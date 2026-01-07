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

  const handleSubmit = async (data: Partial<ReproductionEvent>) => {
    try {
      await updateEvent(event.event_id, {
        ...data,
        updated_at: new Date().toISOString(),
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
