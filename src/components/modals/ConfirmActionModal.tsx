"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const ConfirmActionModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: ConfirmActionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[90%] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </div>
        <DialogFooter className="flex flex-row gap-3 mt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-lg font-semibold uppercase text-xs"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant="destructive"
            className="flex-1 rounded-lg font-semibold uppercase text-xs shadow-lg shadow-destructive/20"
          >
            Sim, Limpar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
