import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

interface PesoMedido {
  valor: number;
  mes: string;
}

interface GainDaily {
  dailyGain: number;
  days: number;
  endDate: string;
  initialDate: string;
  totalGain: number;
}

interface WeightListProps {
  pesosMedidos: PesoMedido[];
  editPeso: (index: number, valor: string) => void;
  deletePeso: (index: number) => void;
  gainDaily: GainDaily[];
}

export function WeightList({
  pesosMedidos,
  editPeso,
  deletePeso,
  gainDaily,
}: WeightListProps) {
  const [open, setOpen] = useState(false);
  const [valorEdit, setValorEdit] = useState("");
  const [indexEdit, setIndexEdit] = useState<number | null>(null);

  const handleOpen = (index: number, valor: number) => {
    setIndexEdit(index);
    setValorEdit(String(valor));
    setOpen(true);
  };

  const handleSave = () => {
    if (indexEdit !== null) {
      editPeso(indexEdit, valorEdit);
      setOpen(false);
    }
  };

  function diferencaEmDias(data1: string, data2: string): number {
    const [dia1, mes1, ano1] = data1.split("/").map(Number);
    const [dia2, mes2, ano2] = data2.split("/").map(Number);

    const d1 = new Date(ano1, mes1 - 1, dia1);
    const d2 = new Date(ano2, mes2 - 1, dia2);

    const diffEmMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
  }

  const valueInteval = (i: number): string => {
    if (i === 0) return "0";

    const days = diferencaEmDias(pesosMedidos[i].mes, pesosMedidos[i - 1].mes);
    return String(days);
  };

  const valueGmd = (i: number): string => {
    if (i === 0) return "0";

    const entry = gainDaily.find((g) => g.endDate === pesosMedidos[i].mes);
    if (!entry) return "0";
    return String(entry.dailyGain);
  };

  return (
    <div className="space-y-4 mt-6">
      {pesosMedidos?.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border rounded-xl p-3 bg-white shadow-sm"
        >
          <div className="relative w-full flex flex-col items-start gap-3 border border-gray-400 px-1 py-2.5 rounded-lg">
            <div className="flex flex-col items-start gap-[2px] pl-3">
              <span className="absolute bg-white -top-2 left-2 px-2 text-xs font-semibold text-gray-400">
                {i === 0 ? "Peso Nascimento" : `${i}° Pesagem`}
              </span>
              <span className="text-xs font-semibold text-primary mt-1">
                {p.mes}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#1162AE] flex flex-row items-center pl-3 gap-1">
              {p.valor}
              <span className="text-xs font-medium text-gray-400 lowercase">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex flex-col justify-center items-center gap-3">
              <div className="relative flex flex-col items-center justify-center w-20 border border-gray-400 px-1 py-2 rounded-lg">
                <h4 className="absolute bg-white -top-2 left-2 px-1 text-xs font-semibold text-gray-400">
                  Intervalo
                </h4>
                <div className="flex flex-row gap-1 items-center justify-center">
                  <span className="uppercase text-sm font-bold text-primary">
                    {valueInteval(i)}
                  </span>
                  <span className="text-xs text-gray-400">dias</span>
                </div>
              </div>
              <div className="relative flex flex-col items-center justify-center w-20 border border-gray-400 px-1 py-2 rounded-lg">
                <h4 className="absolute bg-white -top-2 left-2 px-1 text-xs font-semibold text-gray-400">
                  GMD
                </h4>
                <div className="flex flex-row gap-1 items-center justify-center">
                  <span className="uppercase text-sm font-bold text-primary">
                    {valueGmd(i)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleOpen(i, p.valor)}
                className="text-gray-500 border-gray-400"
              >
                <Pencil className="w-4 h-4" color="blue" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deletePeso(i)}
                className="text-gray-500 border-gray-400"
              >
                <Trash2 className="w-4 h-4" color="red" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="w-full text-left font-bold text-[#1162AE]">
              Editar Peso
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Input
              type="number"
              value={valorEdit}
              onChange={(e) => setValorEdit(e.target.value)}
              step="0.1"
              placeholder="Novo valor (kg)"
            />
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#1162AE]" onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
