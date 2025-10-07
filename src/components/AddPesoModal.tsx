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
  const [mes, setMes] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mes.trim() && valor.trim()) {
      onAddPeso(mes.trim(), Number(valor));
      setMes("");
      setValor("");
      setOpen(false);
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
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
    return monthNames[now.getMonth()];
  };

  const isPeso = type === "peso";
  const title = isPeso ? "Adicionar Peso" : "Adicionar Circunferência Escrotal";
  const description = isPeso
    ? "Digite o nome do mês e o peso em kg"
    : "Digite o nome do mês e a circunferência em cm";
  const placeholder = isPeso
    ? "Ex: Janeiro, Fev/24, Março 2024"
    : "Ex: Janeiro, Fev/24, Março 2024";
  const unit = isPeso ? "kg" : "cm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-900 text-white">
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mes" className="text-sm font-medium">
              Nome do Mês
            </label>
            <Input
              id="mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              placeholder={placeholder}
              required
            />
            <p className="text-xs text-gray-500">
              Exemplos: &quot;{getCurrentMonth()}&quot;, &quot;Fev/24&quot;,
              &quot;Março 2024&quot;, &quot;Abril&quot;
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="valor" className="text-sm font-medium">
              Valor ({unit})
            </label>
            <Input
              id="valor"
              type="number"
              step="0.1"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={`Digite o valor em ${unit}`}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!mes.trim() || !valor.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
