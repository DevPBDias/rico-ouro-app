"use client";

import Header from "@/components/layout/Header";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClients } from "@/hooks/db/clients/useClients";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SuccessModal } from "@/components/modals/SuccessModal";
import { v4 as uuidv4 } from "uuid";

export default function NovoClientePage() {
  const { createClient, isLoading } = useClients();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      await createClient({
        id: uuidv4(),
        ...data,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-10">
      <Header title="Novo Cliente" />
      <div className="p-5">
        <div className="bg-white/50 rounded-3xl p-6 border border-white scroll-mt-20">
            <h2 className="text-lg font-black text-primary mb-6 uppercase tracking-tight">Cadastro de Cliente</h2>
            <ClientForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => router.push("/gerenciar/clientes")}
        title="Cliente cadastrado!"
        message="O novo cliente foi salvo com sucesso e já está disponível."
      />
    </main>
  );
}
