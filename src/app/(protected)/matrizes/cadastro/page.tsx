"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFarms } from "@/hooks/useFarms";
import useMatrizDB from "@/hooks/useMatrizDB";
import { FormatData } from "@/utils/formatDates";
import { Matriz } from "@/lib/db";
import type { IStatus } from "@/types/status-type";

type FormState = {
  rgn: string;
  nasc: string;
  serieRGD: string;
  iabcgz: string;
  deca: string;
  nome: string;
  sexo: string;
  status: IStatus | "";
  type: Matriz["type"] | "";
  genotipagem: "Sim" | "Não" | "";
  condition: Matriz["condition"] | "";
  farm: string;
};

const page = () => {
  const router = useRouter();
  const { farms } = useFarms();
  const { adicionarMatriz } = useMatrizDB();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    rgn: "",
    nasc: "",
    serieRGD: "",
    iabcgz: "",
    deca: "",
    nome: "",
    sexo: "F",
    status: "",
    type: "",
    genotipagem: "",
    condition: "",
    farm: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newAnimal: Matriz = {
      nome: "",
      serieRGD: "INDI",
      rgn: formData.rgn,
      sexo: formData.sexo === "Macho" ? "M" : "F",
      nasc: FormatData(formData.nasc),
      iabcgz: "-",
      deca: "-",
      p: "-",
      f: "-",
      status: (formData.status as IStatus) || undefined,
      farm: formData.farm || undefined,
      type: (formData.type as Matriz["type"]) || undefined,
      genotipagem: (formData.genotipagem as "Sim" | "Não") || undefined,
      condition: (formData.condition as Matriz["condition"]) || undefined,
      vacinas: [],
      updatedAt: FormatData(new Date().toISOString()),
    };

    try {
      await adicionarMatriz(newAnimal);
      setShowModal(true);
    } catch (error) {
      console.error("❌ Erro ao adicionar animal:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      rgn: "",
      nasc: "",
      serieRGD: "",
      iabcgz: "",
      deca: "",
      nome: "",
      sexo: "F",
      status: "",
      type: "",
      genotipagem: "",
      condition: "",
      farm: "",
    });
  };

  return (
    <main>
      <Header title="Cadastro Matriz" />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5 items-center w-full py-5 px-4"
      >
        <div className="w-full flex flex-col items-start gap-2">
          <label
            htmlFor="nome"
            className="text-primary uppercase text-xs font-bold"
          >
            nome
          </label>
          <Input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={({ target }) =>
              setFormData({ ...formData, nome: target.value })
            }
            className="flex-1 bg-muted border rounded-md px-4 py-2 text-foreground text-sm"
            required
          />
        </div>
        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1.5">
            <label
              htmlFor="rgn"
              className="text-primary uppercase text-xs font-bold"
            >
              RGN
            </label>
            <Input
              type="text"
              id="rgn"
              name="rgn"
              value={formData.rgn}
              onChange={({ target }) =>
                setFormData({ ...formData, rgn: target.value })
              }
              className="flex-1 bg-muted rounded-md px-4 py-2 text-foreground border text-sm"
              required
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label
              htmlFor="rgd"
              className="text-primary uppercase text-xs font-bold"
            >
              serie/rgd
            </label>
            <Input
              type="text"
              id="rgd"
              name="rgd"
              value={formData.serieRGD}
              onChange={({ target }) =>
                setFormData({ ...formData, serieRGD: target.value })
              }
              className="flex-1 bg-muted border rounded-md px-4 py-2 text-foreground text-sm"
              required
            />
          </div>
        </section>
        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1.5">
            <label
              htmlFor="iabcgz"
              className="text-primary uppercase text-xs font-bold"
            >
              iabcgz
            </label>
            <Input
              type="text"
              id="iabcgz"
              name="iabcgz"
              value={formData.iabcgz}
              onChange={({ target }) =>
                setFormData({ ...formData, iabcgz: target.value })
              }
              className="flex-1 bg-muted rounded-md px-4 py-2 text-foreground border text-sm"
              required
            />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label
              htmlFor="deca"
              className="text-primary uppercase text-xs font-bold"
            >
              deca
            </label>
            <Input
              type="text"
              id="deca"
              name="deca"
              value={formData.deca}
              onChange={({ target }) =>
                setFormData({ ...formData, deca: target.value })
              }
              className="flex-1 bg-muted border rounded-md px-4 py-2 text-foreground text-sm"
              required
            />
          </div>
        </section>
        <section className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <label
              htmlFor="status"
              className="text-primary uppercase text-xs font-bold w-24 text-left"
            >
              Status
            </label>
            <Select
              value={formData.status}
              name="status"
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as IStatus })
              }
            >
              <SelectTrigger
                id="status"
                name="status"
                className="w-full bg-muted border rounded-md px-4 py-2 text-foreground"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Descarte">Descarte</SelectItem>
                  <SelectItem value="RGD">RGD</SelectItem>
                  <SelectItem value="RGN">RGN</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                  <SelectItem value="Troca">Troca</SelectItem>
                  <SelectItem value="SRGN">SRGN</SelectItem>
                  <SelectItem value="Morte">Morte</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1.5 w-full">
            <label
              htmlFor="type"
              className="text-primary uppercase text-xs font-bold w-24 text-left"
            >
              Função
            </label>
            <Select
              value={formData.type}
              name="type"
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as Matriz["type"] })
              }
            >
              <SelectTrigger
                id="type"
                name="type"
                className="w-full bg-muted border rounded-md px-4 py-2 text-foreground"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Doadora">Doadora</SelectItem>
                  <SelectItem value="Reprodutora">Reprodutora</SelectItem>
                  <SelectItem value="Receptora FIV">Receptora FIV</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>
        <section className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <label
              htmlFor="condition"
              className="text-primary uppercase text-xs font-bold w-24 text-left"
            >
              Condição
            </label>
            <Select
              value={formData.condition}
              name="condition"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  condition: value as Matriz["condition"],
                })
              }
            >
              <SelectTrigger
                id="condition"
                name="condition"
                className="w-full bg-muted border rounded-md px-4 py-2 text-foreground"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Parida">Parida</SelectItem>
                  <SelectItem value="Solteira">Solteira</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <label
              htmlFor="data"
              className="text-primary uppercase text-xs font-bold"
            >
              Nascimento
            </label>
            <Input
              type="date"
              id="data"
              name="data"
              value={formData.nasc}
              onChange={({ target }) =>
                setFormData({ ...formData, nasc: target.value })
              }
              className="bg-muted border rounded-md pr-4 py-2 text-foreground text-sm"
              required
            />
          </div>
        </section>
        <section className="w-full grid grid-cols-2 gap-4">
          <div className="flex flex-col items-start gap-1.5 w-full">
            <label
              htmlFor="status"
              className="text-primary uppercase text-xs font-bold w-24 text-left"
            >
              genotipagem
            </label>
            <Select
              value={formData.genotipagem}
              name="genotipagem"
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  genotipagem: value as "Sim" | "Não",
                })
              }
            >
              <SelectTrigger
                id="status"
                name="status"
                className="w-full bg-muted border rounded-md px-4 py-2 text-foreground"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1.5 w-full">
            <label
              htmlFor="type"
              className="text-primary uppercase text-xs font-bold w-24 text-left"
            >
              Fazenda
            </label>
            <Select
              value={formData.farm}
              name="farm"
              onValueChange={(value) =>
                setFormData({ ...formData, farm: value })
              }
            >
              <SelectTrigger
                id="type"
                name="type"
                className="w-full bg-muted border rounded-md px-4 py-2 text-foreground"
              >
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.farmName}>
                      {farm.farmName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>
        <Button
          variant="default"
          type="submit"
          className="w-full text-sm uppercase font-semibold py-4 rounded-lg mt-6 "
        >
          Cadastrar
        </Button>
      </form>

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
                  Continuar
                </Button>
                <Button
                  onClick={() => router.push("/home")}
                  className="w-full border-2 border-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Ínicio
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default page;
