"use client";

import Header from "@/components/layout/Header";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { useClientById } from "@/hooks/db/clients/useClientById";
import { useClients } from "@/hooks/db/clients/useClients";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/components/clients/ClientForm";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClienteDetalhesPage() {
  const { id } = useParams() as { id: string };
  const { client, isLoading: isClientLoading } = useClientById(id);
  const { updateClient, deleteClient, isLoading: isMutationLoading } = useClients();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  const handleUpdate = async (data: any) => {
    try {
      await updateClient(id, data);
      setIsEditing(false);
      setShowEditSuccess(true);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClient(id);
      router.push("/gerenciar/clientes");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  if (isClientLoading) {
    return (
      <main className="min-h-screen bg-background pb-10">
        <Header title="Detalhes do Cliente" />
        <div className="p-5 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-background pb-10">
        <Header title="Não encontrado" />
        <div className="p-10 text-center">
          <p className="text-muted-foreground">Cliente não encontrado.</p>
          <Button onClick={() => router.push("/gerenciar/clientes")} className="mt-4">
            Voltar para lista
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-10">
      <Header title={isEditing ? "Editar Cliente" : "Detalhes do Cliente"} />
      
      <div className="p-5">
        {isEditing ? (
          <div className="bg-white rounded-3xl p-6 border border-white animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-primary uppercase tracking-tight">Editar Cliente</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-xl h-10 w-10">
                    <X size={20} />
                </Button>
             </div>
             <ClientForm initialData={client} onSubmit={handleUpdate} isLoading={isMutationLoading} />
          </div>
        ) : (
          <ClientDetails 
            client={client} 
            onEdit={() => setIsEditing(true)} 
            onDelete={() => setShowDeleteConfirm(true)} 
          />
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir cliente?"
        description={`Tem certeza que deseja excluir ${client.name}? Esta ação não pode ser desfeita localmente.`}
        isLoading={isMutationLoading}
      />

      <SuccessModal
        open={showEditSuccess}
        onClose={() => setShowEditSuccess(false)}
        title="Cliente editado!"
        message="As informações do cliente foram atualizadas com sucesso."
      />
    </main>
  );
}
