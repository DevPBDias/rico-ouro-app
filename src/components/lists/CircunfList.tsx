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

interface CEMedido {
  valor: number;
  mes: string;
}

interface CircunfListProps {
  CEMedidos: CEMedido[];
  editCE: (index: number, valor: string) => void;
  deleteCE: (index: number) => void;
}

export function CircunfList({ CEMedidos, editCE, deleteCE }: CircunfListProps) {
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
      editCE(indexEdit, valorEdit);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      {CEMedidos?.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between border rounded-xl p-3 bg-white shadow-sm"
        >
          <div className="flex flex-col items-start gap-3">
            <span className="text-base font-semibold text-[#1162AE]/80">
              {i + 1}° Medição
            </span>
            <span className="text-2xl font-bold text-gray-800">
              {p.valor} cm
            </span>
            <span className="text-sm text-gray-500">{p.mes}</span>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpen(i, p.valor)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => deleteCE(i)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="w-full text-left font-bold text-[#1162AE]">
              Editar CE
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
