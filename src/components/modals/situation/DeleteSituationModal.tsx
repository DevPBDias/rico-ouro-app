"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimalSituation } from "@/types/situation.type";

interface DeleteSituationModalProps {
  open: boolean;
  situations: AnimalSituation[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteSituationModal({
  open,
  situations,
  onClose,
  onDelete,
}: DeleteSituationModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  const options = useMemo(() => {
    return [...situations].sort((a, b) =>
      a.situation_name.localeCompare(b.situation_name, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [situations]);

  if (!open) return null;

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedId == null) {
      setError("Selecione uma situação para excluir.");
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(selectedId);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir situação.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-primary">
              Excluir situação cadastrada
            </h2>
            <p className="text-sm text-muted-foreground">
              Remova situações que não serão mais utilizadas.
            </p>
          </header>

          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há situações cadastradas para excluir.
            </p>
          ) : (
            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              <Select
                value={selectedId ?? ""}
                onValueChange={(value) => setSelectedId(value)}
                disabled={isDeleting}
              >
                <SelectTrigger className="bg-muted w-full border-0 rounded-md px-4 py-3 text-sm text-black">
                  <SelectValue placeholder="Selecione a situação" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((situation) => (
                    <SelectItem key={situation.id} value={situation.id} className="text-black">
                      {situation.situation_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {error && <span className="text-sm text-red-500">{error}</span>}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeleting || selectedId == null}
                >
                  Excluir
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
