"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StandardTabList } from "@/components/ui/StandardTabList";
import {
  ShoppingCart,
  Users,
  ClipboardList,
  LineChart,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { SalesList } from "./SalesList";
import { SalesDetails } from "./SalesDetails";
import { SalesSummary } from "./SalesSummary";
import { ClientList } from "@/components/clients/ClientList";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClientById } from "@/hooks/db/clients/useClientById";
import { useClients } from "@/hooks/db/clients/useClients";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MainTab = "vendas" | "clientes";
type SalesSubTab = "detalhes" | "graficos" | "resumo";

export function CommercialDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>("vendas");
  const [salesSubTab, setSalesSubTab] = useState<SalesSubTab>("detalhes");

  // Client management state (migrated from clientes page)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  const { client, isLoading: isClientLoading } = useClientById(
    selectedClientId || "",
  );
  const {
    updateClient,
    deleteClient,
    isLoading: isMutationLoading,
  } = useClients();

  const handleClientUpdate = async (data: any) => {
    if (!selectedClientId) return;
    try {
      await updateClient(selectedClientId, data);
      setIsEditing(false);
      setShowEditSuccess(true);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
    }
  };

  const handleClientDelete = async () => {
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
    <div className="space-y-4">
      {/* Main Tabs: Vendas | Clientes */}
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as MainTab)}
        className="w-full"
      >
        <StandardTabList
          variant="simple"
          tabs={[
            { value: "vendas", label: "Vendas", icon: ShoppingCart },
            { value: "clientes", label: "Clientes", icon: Users },
          ]}
          activeTab={mainTab}
          onTabChange={(v) => setMainTab(v as MainTab)}
        />

        <TabsContent value="vendas" className="mt-4">
          {/* Sales Sub-Tabs: Detalhes | Gráficos | Resumo */}
          <Tabs
            value={salesSubTab}
            onValueChange={(v) => setSalesSubTab(v as SalesSubTab)}
            className="w-full"
          >
            <StandardTabList
              variant="simple"
              tabs={[
                { value: "detalhes", label: "Detalhes", icon: ClipboardList },
                { value: "graficos", label: "Gráficos", icon: LineChart },
                { value: "resumo", label: "Resumo", icon: BarChart3 },
              ]}
              activeTab={salesSubTab}
              onTabChange={(v) => setSalesSubTab(v as SalesSubTab)}
            />

            <TabsContent value="detalhes" className="mt-4">
              <SalesList />
            </TabsContent>

            <TabsContent value="graficos" className="mt-4">
              <SalesDetails />
            </TabsContent>

            <TabsContent value="resumo" className="mt-4">
              <SalesSummary />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="clientes" className="mt-4">
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
                        onSubmit={handleClientUpdate}
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
                  <p className="text-muted-foreground">
                    Cliente não encontrado.
                  </p>
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
        </TabsContent>
      </Tabs>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleClientDelete}
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
    </div>
  );
}
