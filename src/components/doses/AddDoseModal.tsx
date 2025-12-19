"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface AddDoseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    animalName: string;
    breed: string;
    quantity: number;
  }) => void;
  existingBreeds: string[];
}

export function AddDoseModal({
  open,
  onClose,
  onAdd,
  existingBreeds,
}: AddDoseModalProps) {
  const [animalName, setAnimalName] = useState("");
  const [breed, setBreed] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!animalName.trim()) {
      setError("Nome do animal é obrigatório");
      return;
    }

    if (!breed.trim()) {
      setError("Raça é obrigatória");
      return;
    }

    if (quantity < 0) {
      setError("Quantidade não pode ser negativa");
      return;
    }

    onAdd({
      animalName: animalName.trim(),
      breed: breed.trim(),
      quantity,
    });

    setAnimalName("");
    setBreed("");
    setQuantity(1);
    onClose();
  };

  const handleClose = () => {
    setAnimalName("");
    setBreed("");
    setQuantity(1);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95%] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Animal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="animalName"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Nome do Animal
            </label>
            <Input
              id="animalName"
              value={animalName}
              onChange={(e) => setAnimalName(e.target.value)}
              placeholder="Ex: Touro X123"
              className="py-5"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="breed"
              className="text-xs font-bold uppercase text-muted-foreground"
            >
              Raça
            </label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex: Nellore"
              list="breed-suggestions"
              className="py-5"
            />
            {existingBreeds.length > 0 && (
              <datalist id="breed-suggestions">
                {existingBreeds.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            )}
            {existingBreeds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {existingBreeds.slice(0, 4).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBreed(b)}
                    className={`
                      px-2 py-1 text-xs rounded-md border transition-colors
                      ${
                        breed === b
                          ? "bg-primary text-white border-primary"
                          : "bg-muted border-transparent hover:border-primary/30"
                      }
                    `}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Quantidade Inicial
            </label>
            <div className="flex items-center justify-center gap-2 bg-muted p-3 rounded-lg">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 text-xs font-bold"
                onClick={() => setQuantity(Math.max(0, quantity - 5))}
                disabled={quantity < 5}
              >
                -5
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                disabled={quantity <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold text-primary w-14 text-center tabular-nums">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 text-xs font-bold"
                onClick={() => setQuantity(quantity + 5)}
              >
                +5
              </Button>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 mt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 rounded-lg font-semibold uppercase text-xs py-5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg font-semibold uppercase text-xs py-5 shadow-lg shadow-primary/20"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
