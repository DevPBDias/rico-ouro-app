"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddClassificationModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

export function AddClassificationModal({ open, onClose, onAdd }: AddClassificationModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe o nome da classificação.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd(trimmed);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao adicionar classificação.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">
              Cadastrar nova classificação
            </h2>
            <p className="text-sm text-muted-foreground">
              Adicione classificações personalizadas para utilizar na lista.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              value={name}
              placeholder="Nome da classificação"
              onChange={(event) => setName(event.target.value)}
              autoFocus
              disabled={isSubmitting}
            />
            {error && <span className="text-sm text-red-500">{error}</span>}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
