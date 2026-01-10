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

  const handleSubmit = async (data: Partial<ReproductionEvent>) => {
    try {
      await createEvent({
        ...data,
        rgn, // Garante o RGN da matriz
        _deleted: false,
      });
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
