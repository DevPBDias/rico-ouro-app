"use client";

import { useState, useEffect } from "react";
import { Client } from "@/types/client.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validateClientForm,
  formatters,
} from "@/lib/validations/client.validation";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ClientForm({
  initialData,
  onSubmit,
  isLoading,
}: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    cpf_cnpj: "",
    inscricao_estadual: "",
    phone: "",
    farm: "",
    city: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        cpf_cnpj: initialData.cpf_cnpj || "",
        inscricao_estadual: initialData.inscricao_estadual || "",
        phone: initialData.phone || "",
        farm: initialData.farm || "",
        city: initialData.city || "",
        email: initialData.email || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Aplica formatação automática para campos específicos
    let formattedValue = value;
    if (name === "cpf_cnpj") {
      formattedValue = formatters.cpfCnpj(value);
    } else if (name === "phone") {
      formattedValue = formatters.phone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    // Limpa erro do campo ao digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateClientForm(formData);

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 animate-in fade-in duration-500"
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="name"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          Nome do Cliente *
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: João da Silva"
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.name ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.name && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="cpf_cnpj"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          CPF / CNPJ *
        </Label>
        <Input
          id="cpf_cnpj"
          name="cpf_cnpj"
          value={formData.cpf_cnpj}
          onChange={handleChange}
          placeholder="000.000.000-00"
          maxLength={18}
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.cpf_cnpj ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.cpf_cnpj && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.cpf_cnpj}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="phone"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          Telefone
        </Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(00) 0 0000-0000"
          maxLength={16}
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.phone ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.phone && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="city"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          Cidade
        </Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Ex: Uberlandia"
          maxLength={100}
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.city ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.city && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.city}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="farm"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          Fazenda
        </Label>
        <Input
          id="farm"
          name="farm"
          value={formData.farm}
          onChange={handleChange}
          placeholder="Ex: Estancia Ouro"
          maxLength={100}
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.farm ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.farm && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.farm}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="cliente@email.com"
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.email ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="inscricao_estadual"
          className="text-[10px] font-bold uppercase text-primary ml-1"
        >
          Inscrição Estadual
        </Label>
        <Input
          id="inscricao_estadual"
          name="inscricao_estadual"
          value={formData.inscricao_estadual}
          onChange={handleChange}
          placeholder="Número da IE"
          maxLength={20}
          className={`h-12 rounded-xl bg-white shadow-sm border-muted focus-visible:ring-primary ${errors.inscricao_estadual ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {errors.inscricao_estadual && (
          <p className="text-xs text-destructive font-semibold ml-1">
            {errors.inscricao_estadual}
          </p>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl border-primary text-primary font-bold uppercase text-xs"
          onClick={() => history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 h-12 rounded-xl font-bold uppercase text-xs"
        >
          {isLoading ? "Salvando..." : initialData ? "Confirmar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
