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
import type { Vaccine } from "@/types/schemas.types";

interface DeleteVaccineModalProps {
  open: boolean;
  vaccines: Vaccine[];
  onClose: () => void;
  onDelete: (uuid: string) => Promise<void>;
}

export function DeleteVaccineModal({
  open,
  vaccines,
  onClose,
  onDelete,
}: DeleteVaccineModalProps) {
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedUuid(null);
      setError(null);
      setIsDeleting(false);
    }
  }, [open]);

  const options = useMemo(() => {
    return [...vaccines].sort((a, b) =>
      a.vaccineName.localeCompare(b.vaccineName, "pt-BR", {
        sensitivity: "base",
      })
    );
  }, [vaccines]);

  if (!open) return null;

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedUuid == null) {
      setError("Selecione uma vacina para excluir.");
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(selectedUuid);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir vacina.";
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
              Excluir vacina cadastrada
            </h2>
            <p className="text-sm text-muted-foreground">
              Remova vacinas que não serão mais utilizadas.
            </p>
          </header>

          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Não há vacinas cadastradas para excluir.
            </p>
          ) : (
            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              <Select
                value={selectedUuid ?? ""}
                onValueChange={(value) => setSelectedUuid(value)}
                disabled={isDeleting}
              >
                <SelectTrigger className="bg-muted w-full border-0 rounded-md px-4 py-3 text-sm">
                  <SelectValue placeholder="Selecione a vacina" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((vaccine) => (
                    <SelectItem key={vaccine.uuid} value={vaccine.uuid!}>
                      {vaccine.vaccineName}
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
                  disabled={isDeleting || selectedUuid == null}
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
