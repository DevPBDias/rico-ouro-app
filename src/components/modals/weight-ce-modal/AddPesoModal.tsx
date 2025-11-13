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
  const [data, setData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim() && data.trim()) {
      const [ano, mes, dia] = data.split("-");
      const dataFormatada = `${dia}/${mes}/${ano}`;

      onAddPeso(dataFormatada, Number(valor));
      setValor("");
      setData("");
      setOpen(false);
    }
  };

  const isPeso = type === "peso";
  const title = isPeso ? "Adicionar Peso" : "Adicionar Circunferência Escrotal";
  const description = isPeso
    ? "Informe o peso em kg e selecione a data da pesagem."
    : "Informe a circunferência em cm e selecione a data da medição.";
  const unit = isPeso ? "kg" : "cm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" variant="default" className="bg-[#1162AE]">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-full text-xl text-left font-bold text-[#1162AE]">
            {title}
          </DialogTitle>
          <DialogDescription className="w-full text-base text-left">
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

          <div className="space-y-2">
            <label
              htmlFor="data"
              className="text-lg font-semibold text-[#1162AE]"
            >
              Data da medição
            </label>
            <Input
              id="data"
              type="date"
              value={data}
              className="my-2 h-10"
              onChange={(e) => setData(e.target.value)}
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
              disabled={!valor.trim() || !data.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
