"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnershipSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
}

export function PartnershipSuccessModal({
  open,
  onClose,
  onNavigateHome,
}: PartnershipSuccessModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center gap-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="bg-green-50 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-primary">Sucesso!</h2>
            <p className="text-muted-foreground text-sm px-4">
              A sociedade do animal foi atualizada com sucesso no sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            <Button
              onClick={onNavigateHome}
              className="w-full py-6 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              IR PARA HOME
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full py-6 rounded-xl font-bold text-base border-2 hover:bg-muted"
            >
              FECHAR
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
