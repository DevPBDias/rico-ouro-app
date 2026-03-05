"use client";

import { useClients } from "@/hooks/db/clients/useClients";
import { Input } from "@/components/ui/input";
import { Accordion } from "@/components/ui/accordion";
import { ClientListItem } from "./ClientListItem";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientListProps {
  onSelectClient: (id: string) => void;
}

export function ClientList({ onSelectClient }: ClientListProps) {
  const { clients, isLoading, searchClients } = useClients();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase text-primary mb-1">
          Buscar cliente
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Nome ou CPF/CNPJ..."
              className="pl-10 h-12 rounded-xl bg-white shadow-sm border-none focus-visible:ring-primary"
              onChange={(e) => searchClients(e.target.value)}
            />
          </div>
          <Button
            size="icon"
            className="h-12 w-12 rounded-xl shadow-md shrink-0"
            onClick={() => router.push("/gerenciar/clientes/novo")}
          >
            <UserPlus size={20} />
          </Button>
        </div>
      </div>

      {/* List Section */}
      <div className="mt-2">
        <h2 className="text-xs font-bold uppercase text-muted-foreground mb-4">
          Lista de clientes ({clients.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : clients.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {clients.map((client) => (
              <ClientListItem
                key={client.id}
                client={client}
                onSelect={() => onSelectClient(client.id)}
              />
            ))}
          </Accordion>
        ) : (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground mb-4">
              <Search size={32} />
            </div>
            <p className="text-muted-foreground font-medium">
              Nenhum cliente encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
