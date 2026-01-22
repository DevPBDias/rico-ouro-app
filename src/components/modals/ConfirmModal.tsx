"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  variant = "destructive",
  onClose,
  onConfirm,
  isLoading,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
          <div className={`p-4 rounded-full ${variant === 'destructive' ? 'bg-red-50' : 'bg-primary/5'}`}>
            <AlertCircle className={`w-12 h-12 ${variant === 'destructive' ? 'text-red-500' : 'text-primary'}`} strokeWidth={2} />
          </div>
          
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-xl font-bold text-primary leading-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full border-2 border-primary/20 text-sm uppercase text-primary font-bold py-3 h-auto rounded-xl hover:bg-primary/5 transition-colors"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={variant}
              disabled={isLoading}
              onClick={onConfirm}
              className={`w-full text-sm uppercase font-bold py-3 h-auto rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                variant === 'destructive' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isLoading ? "Aguarde..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
