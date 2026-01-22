"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  buttonLabel?: string;
}

export function SuccessModal({
  open,
  onClose,
  title,
  message,
  buttonLabel = "Continuar",
}: SuccessModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
          <div className="p-4 bg-green-50 rounded-full">
            <CheckCircle2
              className="w-16 h-16 text-green-500"
              strokeWidth={2.5}
            />
          </div>
          
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-xl font-bold text-primary leading-tight uppercase">
              {title}
            </h2>
            {message && (
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-2 border-primary text-sm uppercase text-primary font-bold py-6 rounded-xl hover:bg-primary/5 transition-colors shadow-sm active:scale-[0.98]"
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
