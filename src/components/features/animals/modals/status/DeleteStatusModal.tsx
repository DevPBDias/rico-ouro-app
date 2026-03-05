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
import { AnimalStatus } from "@/types/status.type";

interface DeleteStatusModalProps {
  open: boolean;
  statuses: AnimalStatus[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteStatusModal({
  open,
  statuses,
  onClose,
  onDelete,
}: DeleteStatusModalProps) {
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
    return [...statuses].sort((a, b) =>
      a.status_name.localeCompare(b.status_name, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [statuses]);

  if (!open) return null;

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedId == null) {
      setError("Selecione um status para excluir.");
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(selectedId);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir status.";
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
              Excluir status cadastrado
            </h2>
            <p className="text-sm text-muted-foreground">
              Remova status que não serão mais utilizados.
            </p>
          </header>

          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há status cadastrados para excluir.
            </p>
          ) : (
            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              <Select
                value={selectedId ?? ""}
                onValueChange={(value) => setSelectedId(value)}
                disabled={isDeleting}
              >
                <SelectTrigger className="bg-muted w-full border-0 rounded-md px-4 py-3 text-sm">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.status_name}
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
