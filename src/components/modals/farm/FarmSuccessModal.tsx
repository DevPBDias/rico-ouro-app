"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FarmSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
}

export function FarmSuccessModal({
  open,
  onClose,
  onNavigateHome,
}: FarmSuccessModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
          <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={2.5} />
          <p className="text-primary text-base uppercase font-bold text-center">
            Fazenda atualizada com sucesso!
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-2 border-primary text-sm uppercase text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Continuar
            </Button>
            <Button
              onClick={onNavigateHome}
              className="w-full border-2 border-primary text-sm uppercase text-white font-semibold py-3 rounded-lg hover:bg-primary/5 transition-colors"
            >
              Início
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

