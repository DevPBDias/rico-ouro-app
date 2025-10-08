"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddPesoModalProps {
  onAddPeso: (mes: string, valor: number) => void;
  type: "peso" | "circunferencia";
}

export function AddPesoModal({ onAddPeso, type }: AddPesoModalProps) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim()) {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const mesFormatado = `${day} de ${month} de ${year}`;

      onAddPeso(mesFormatado, Number(valor));
      setValor("");
      setOpen(false);
    }
  };

  const isPeso = type === "peso";
  const title = isPeso ? "Adicionar Peso" : "Adicionar Circunferência Escrotal";
  const description = isPeso
    ? "Informe o peso em kg. A data será registrada automaticamente."
    : "Informe a circunferência em cm. A data será registrada automaticamente.";
  const unit = isPeso ? "kg" : "cm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="bg-[#1162AE] text-white">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-full text-xl text-left font-bold text-[#1162AE]">
            {title}
          </DialogTitle>
          <DialogDescription className="w-full text-base text-left ">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="valor"
              className="text-lg font-semibold text-[#1162AE]"
            >
              Valor ({unit})
            </label>
            <Input
              id="valor"
              type="number"
              step="0.1"
              value={valor}
              className="my-2 h-10"
              onChange={(e) => setValor(e.target.value)}
              placeholder={`Digite o valor em ${unit}`}
              required
            />
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-base"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full text-base bg-[#1162AE]"
              disabled={!valor.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
