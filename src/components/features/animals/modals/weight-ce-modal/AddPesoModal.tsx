"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddPesoModalProps {
  onAddPeso: (mes: string, valor: number) => void;
  type: "peso" | "circunferencia";
  isBorn?: boolean;
  setIsBorn?: (value: boolean) => void;
  bornDate?: string;
  lastValue?: number;
}

export function AddPesoModal({
  onAddPeso,
  type,
  isBorn,
  setIsBorn,
  bornDate,
  lastValue,
}: AddPesoModalProps) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim() && data.trim()) {
      const selectedDate = new Date(data);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Final do dia de hoje

      if (selectedDate > today) {
        alert("A data da medição não pode ser no futuro.");
        return;
      }

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
          <DialogDescription className="w-full text-base text-left flex justify-between items-center">
            <span>{description}</span>
            {lastValue !== undefined && lastValue > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">
                LTC: {lastValue} {unit}
              </span>
            )}
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

          <DatePicker
            label="Data da medição"
            value={data}
            onChange={setData}
            required
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="born_metric"
              checked={isBorn}
              onCheckedChange={(checked) => {
                const isChecked = checked as boolean;
                setIsBorn?.(isChecked);
                if (isChecked && bornDate) {
                  // Preencher a data com a data de nascimento
                  // bornDate pode ser DD/MM/YYYY ou ISO
                  let formattedDate = "";
                  if (bornDate.includes("/")) {
                    const [dia, mes, ano] = bornDate.split("/");
                    formattedDate = `${ano}-${mes}-${dia}`;
                  } else {
                    formattedDate = bornDate.split("T")[0];
                  }
                  setData(formattedDate);
                } else {
                  setData("");
                }
              }}
            />
            <Label
              htmlFor="born_metric"
              className="text-base font-semibold text-[#1162AE]"
            >
              {isPeso ? "Peso Nascimento?" : "Medição Inicial?"}
            </Label>
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
