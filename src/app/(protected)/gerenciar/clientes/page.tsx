"use client";

import Header from "@/components/layout/Header";
import { ClientList } from "@/components/clients/ClientList";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { useClientById } from "@/hooks/db/clients/useClientById";
import { useClients } from "@/hooks/db/clients/useClients";
import { useState } from "react";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/components/clients/ClientForm";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientesPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { client, isLoading: isClientLoading } = useClientById(
    selectedClientId || "",
  );
  const {
    updateClient,
    deleteClient,
    isLoading: isMutationLoading,
  } = useClients();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  const handleUpdate = async (data: any) => {
    if (!selectedClientId) return;
    try {
      await updateClient(selectedClientId, data);
      setIsEditing(false);
      setShowEditSuccess(true);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedClientId) return;
    try {
      await deleteClient(selectedClientId);
      setSelectedClientId(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setSelectedClientId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-10">
      <Header
        title={
          isEditing
            ? "Editar Cliente"
            : selectedClientId
              ? "Detalhes do Cliente"
              : "Clientes"
        }
      />

      <div className="p-4">
        {selectedClientId ? (
          <div className="space-y-4">
            <div className="flex items-center mb-2">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="flex items-center gap-2 text-primary font-bold bg-primary/5 hover:bg-primary/10 rounded-xl"
              >
                <ArrowLeft size={18} />
                Voltar
              </Button>
            </div>

            {isClientLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <Skeleton className="h-40 w-full rounded-3xl" />
              </div>
            ) : client ? (
              <>
                {isEditing ? (
                  <div className="bg-white rounded-3xl p-6 border border-white animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-black text-primary uppercase tracking-tight">
                        Editar Cliente
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl h-10 w-10"
                      >
                        <X size={20} />
                      </Button>
                    </div>
                    <ClientForm
                      initialData={client}
                      onSubmit={handleUpdate}
                      isLoading={isMutationLoading}
                    />
                  </div>
                ) : (
                  <ClientDetails
                    client={client}
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => setShowDeleteConfirm(true)}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Cliente não encontrado.</p>
                <Button
                  onClick={() => setSelectedClientId(null)}
                  className="mt-4"
                >
                  Voltar para lista
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ClientList onSelectClient={setSelectedClientId} />
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir cliente?"
        description={`Tem certeza que deseja excluir ${client?.name}? Esta ação não pode ser desfeita localmente.`}
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
