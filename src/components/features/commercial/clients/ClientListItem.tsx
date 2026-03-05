"use client";

import { Client } from "@/types/client.type";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Landmark, FileText } from "lucide-react";

interface ClientListItemProps {
  client: Client;
  onSelect: () => void;
}

export function ClientListItem({ client, onSelect }: ClientListItemProps) {
  return (
    <AccordionItem
      value={client.id}
      className="border-none mb-3 bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-all data-[state=open]:bg-primary/5">
        <div className="flex items-center gap-3 text-left">
          <span className="text-sm font-bold text-primary">{client.name}</span>
          {client.farm && (
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              {client.farm}
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-2 gap-4 text-sm mt-2 border-t pt-4">
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-muted-foreground mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                CPF/CNPJ
              </span>
              <span className="font-medium text-primary">
                {client.cpf_cnpj}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone size={16} className="text-muted-foreground mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                Telefone
              </span>
              <span className="font-medium text-primary">
                {client.phone || "Não informado"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={16} className="text-muted-foreground mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                E-mail
              </span>
              <span className="font-medium truncate max-w-[200px] text-primary">
                {client.email || "Não informado"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-muted-foreground mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                Cidade
              </span>
              <span className="font-medium text-primary">
                {client.city || "Não informado"}
              </span>
            </div>
          </div>

          {client.inscricao_estadual && (
            <div className="flex items-start gap-3">
              <Landmark size={16} className="text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">
                  Inscrição Estadual
                </span>
                <span className="font-medium text-primary">
                  {client.inscricao_estadual}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            className="w-full rounded-xl font-bold uppercase text-xs"
            onClick={onSelect}
          >
            Ver Detalhes
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
