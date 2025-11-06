"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { FormatData } from "@/utils/formatDates";
import { CheckCircle2, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const VaccinesPage = () => {
  const router = useRouter();
  const { adicionarVacina, dados } = useAnimalDB();
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rgn: "",
    vacina: "",
    data: "",
  });

  const rgnOptions = useMemo(() => {
    return dados
      .map((animal) => ({
        label:
          animal.animal.nome?.trim() ||
          `${animal.animal.serieRGD || ""} ${animal.animal.rgn || ""}`.trim(),
        value: animal.animal.rgn || "",
      }))
      .filter((option) => option.value);
  }, [dados]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return rgnOptions;

    return rgnOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rgnOptions, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.rgn || !formData.vacina || !formData.data) {
        setError("Preencha todos os campos");
        return;
      }

      await adicionarVacina(formData.rgn, {
        nome: formData.vacina,
        data: FormatData(formData.data),
      });

      setShowModal(true);
    } catch (error) {
      console.error("❌ Erro ao registrar vacina:", error);
      setError("Animal não encontrado ou erro ao registrar vacina");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      rgn: "",
      vacina: "",
      data: "",
    });
    setSearchTerm("");
  };

  return (
    <main className="min-h-screen">
      <Header title="Anotar vacinas" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex flex-col justify-start items-start w-full gap-2">
          <label
            htmlFor="vacina"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Vacina:
          </label>
          <Select
            value={formData.vacina}
            name="vacina"
            onValueChange={(value) =>
              setFormData({ ...formData, vacina: value })
            }
          >
            <SelectTrigger
              id="vacina"
              name="vacina"
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground w-full"
            >
              <SelectValue placeholder="Selecione a vacina" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Aftosa">Aftosa</SelectItem>
                <SelectItem value="Brucelose">Brucelose</SelectItem>
                <SelectItem value="Raiva">Raiva</SelectItem>
                <SelectItem value="Clostridiose">Clostridiose</SelectItem>
                <SelectItem value="Vermifugação">Vermifugação</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-2 relative">
          <label
            htmlFor="rgn"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Animal vacinado (RGN):
          </label>
          <Input
            type="text"
            name="rgn"
            id="rgn"
            placeholder="Digite o RGN do animal..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOpen(true);
            }}
            className="w-full bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
            onFocus={() => setOpen(true)}
          />
          {open && filteredOptions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md border shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-muted",
                    formData.rgn === option.value && "bg-muted"
                  )}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, rgn: option.value }));
                    setSearchTerm(option.label);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {formData.rgn === option.value && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-2">
          <label
            htmlFor="date"
            className="text-primary font-bold text-sm uppercase w-full text-left"
          >
            Dia da vacina:
          </label>
          <Input
            type="date"
            id="date"
            name="date"
            value={formData.data}
            onChange={({ target }) =>
              setFormData({ ...formData, data: target.value })
            }
            className="w-3/5 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
            required
          />
        </div>

        <Button
          variant="default"
          type="submit"
          className="w-full text-sm font-semibold py-5 rounded-lg mt-8 uppercase "
        >
          Registrar vacina
        </Button>

        {showModal && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={handleCloseModal}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
              <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
                <CheckCircle2
                  className="w-16 h-16 text-green-500"
                  strokeWidth={2.5}
                />
                <p className="text-primary text-base uppercase font-bold text-center">
                  Cadastrado com sucesso!
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    className="w-full border-2 border-primary text-sm uppercase text-primary font-bold py-3 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Continuar
                  </Button>
                  <Button
                    onClick={() => router.push("/home")}
                    className="w-full border-2 border-primary text-sm uppercase text-white font-semibold py-3 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Início
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </main>
  );
};

export default VaccinesPage;
