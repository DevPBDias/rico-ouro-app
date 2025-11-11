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
import type { Farm } from "@/lib/db";

interface DeleteFarmModalProps {
  open: boolean;
  farms: Farm[];
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}

export function DeleteFarmModal({
  open,
  farms,
  onClose,
  onDelete,
}: DeleteFarmModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
    return [...farms].sort((a, b) =>
      a.farmName.localeCompare(b.farmName, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [farms]);

  if (!open) return null;

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedId == null) {
      setError("Selecione uma fazenda para excluir.");
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(selectedId);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir fazenda.";
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
              Excluir fazenda cadastrada
            </h2>
            <p className="text-sm text-muted-foreground">
              Remova fazendas que não serão mais utilizadas.
            </p>
          </header>

          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há fazendas cadastradas para excluir.
            </p>
          ) : (
            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              <Select
                value={selectedId?.toString() ?? ""}
                onValueChange={(value) => setSelectedId(Number(value))}
                disabled={isDeleting}
              >
                <SelectTrigger className="bg-muted w-full border-0 rounded-md px-4 py-3 text-sm">
                  <SelectValue placeholder="Selecione a fazenda" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((farm) => (
                    <SelectItem key={farm.id} value={String(farm.id)}>
                      {farm.farmName}
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

