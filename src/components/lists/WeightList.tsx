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

interface WeightListProps {
  pesosMedidos: PesoMedido[];
  editPeso: (index: number, valor: string) => void;
  deletePeso: (index: number) => void;
}

export function WeightList({
  pesosMedidos,
  editPeso,
  deletePeso,
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

  return (
    <div className="space-y-4 mt-6">
      {pesosMedidos?.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between border rounded-xl p-3 bg-white shadow-sm"
        >
          <div className="flex flex-col items-start gap-3 uppercase">
            <div className="flex flex-col items-start gap-[2px]">
              <span className="text-sm font-semibold text-gray-400">
                {i === 0 ? "Peso Nascimento" : `${i}° Pesagem`}
              </span>
              <span className="text-xs font-medium text-gray-400">{p.mes}</span>
            </div>
            <div className="text-lg font-bold text-[#1162AE] flex flex-row items-center  gap-1">
              {p.valor}
              <span className="text-xs font-medium text-gray-400 lowercase">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center border border-[#1162AE] px-1 py-2 rounded-lg">
              <span className="uppercase text-sm font-bold text-[#1162AE]">
                {i === 0 ? 0 : diferencaEmDias(p.mes, pesosMedidos[i - 1].mes)}{" "}
                dias
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleOpen(i, p.valor)}
                className="text-gray-500 border-gray-400"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => deletePeso(i)}
                className="text-gray-500 border-gray-400"
              >
                <Trash2 className="w-4 h-4" />
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
