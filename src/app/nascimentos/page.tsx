"use client";

import type React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { AnimalData } from "@/lib/db";
import { useAnimalDB } from "@/hooks/useAnimalDB";
import { FormatData } from "@/utils/formatDates";

export default function NascimentosPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    rgn: "",
    data: "",
    peso: "",
    ce: "",
    mae: "",
    pai: "",
    cor: "Branco",
    sexo: "Macho",
  });

  const { adicionarAnimal } = useAnimalDB();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAnimal: AnimalData = {
      animal: {
        nome: "",
        serieRGD: "INDI",
        rgn: formData.rgn,
        sexo: formData.sexo,
        nasc: FormatData(formData.data),
        iabcgz: "-",
        deca: "-",
        p: "-",
        f: "-",
        corNascimento: formData.cor,
        pesosMedidos: [{ mes: "", valor: Number(formData.peso) }],
        circunferenciaEscrotal: [{ mes: "", valor: Number(formData.ce) }],
        updatedAt: FormatData(formData.data),
      },
      pai: { nome: formData.pai || "-" },
      mae: { serieRGD: "INDI", rgn: formData.mae },
    };

    try {
      await adicionarAnimal(newAnimal);
      setShowModal(true);
    } catch (error) {
      console.error("❌ Erro ao adicionar animal:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      rgn: "",
      data: "",
      peso: "",
      ce: "",
      mae: "",
      pai: "",
      cor: "Branco",
      sexo: "Macho",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header title="Nascimentos" />

      <main className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <label
              htmlFor="rgn"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              RGN:
            </label>
            <Input
              type="text"
              id="rgn"
              name="rgn"
              value={formData.rgn}
              onChange={({ target }) =>
                setFormData({ ...formData, rgn: target.value })
              }
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="data"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Data:
            </label>
            <div className="flex-1 relative">
              <Input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={({ target }) =>
                  setFormData({ ...formData, data: target.value })
                }
                className="w-full bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="peso"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Peso:
            </label>
            <Input
              type="text"
              id="peso"
              name="peso"
              value={formData.peso}
              onChange={({ target }) =>
                setFormData({ ...formData, peso: target.value })
              }
              placeholder="kg"
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="peso"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              CE:
            </label>
            <Input
              type="text"
              id="ce"
              name="ce"
              value={formData.ce}
              onChange={({ target }) =>
                setFormData({ ...formData, ce: target.value })
              }
              placeholder="cm"
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="mae"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Mãe RGN:
            </label>
            <Input
              type="text"
              id="mae"
              name="mae"
              value={formData.mae}
              onChange={({ target }) =>
                setFormData({ ...formData, mae: target.value })
              }
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="mae"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Pai:
            </label>
            <Input
              type="text"
              id="pai"
              name="pai"
              value={formData.pai}
              onChange={({ target }) =>
                setFormData({ ...formData, pai: target.value })
              }
              className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="cor"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Cor:
            </label>
            <Select
              value={formData.cor}
              onValueChange={(value) =>
                setFormData({ ...formData, cor: value })
              }
            >
              <SelectTrigger
                id="cor"
                name="cor"
                className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground"
              >
                <SelectValue placeholder="Selecione a cor" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Branco">Branco</SelectItem>
                  <SelectItem value="Vermelho">Vermelho</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label
              htmlFor="sexo"
              className="text-primary uppercase text-sm font-bold w-24 text-left"
            >
              Sexo:
            </label>
            <Select
              value={formData.sexo}
              name="sexo"
              onValueChange={(value) =>
                setFormData({ ...formData, sexo: value })
              }
            >
              <SelectTrigger
                id="sexo"
                name="sexo"
                className="flex-1 bg-muted border-0 rounded-md px-4 py-3 text-foreground"
              >
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Macho">Macho</SelectItem>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="default"
            type="submit"
            className="w-full text-sm uppercase font-semibold py-5 rounded-lg mt-8 "
          >
            Cadastrar
          </Button>
        </form>
      </main>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-6">
              <CheckCircle2
                className="w-24 h-16 text-green-500"
                strokeWidth={2.5}
              />
              <p className="text-primary text-xl font-semibold text-center">
                Cadastrado com sucesso!
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="w-full border-2 border-primary text-primary font-semibold py-3 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Continuar cadastro
                </Button>
                <Button
                  onClick={() => router.push("/home")}
                  className="w-full border-2 border-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Pagina inicial
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
