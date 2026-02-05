"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { MovementList } from "@/components/movements/MovementList";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { MovementForm } from "@/components/movements";

type ViewMode = "list" | "create";

export default function MovimentacoesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const handleCreateSuccess = () => {
    setViewMode("list");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={viewMode === "create" ? "Movimentação" : "Movimentações"}
      />

      <main className="flex-1 px-4 py-6 pb-24 max-w-2xl mx-auto w-full">
        {viewMode === "list" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-primary uppercase">
                Histórico
              </h2>
              <Button
                onClick={() => setViewMode("create")}
                className="rounded-md h-10 px-4 gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Criar
              </Button>
            </div>
            <MovementList />
          </>
        )}

        {viewMode === "create" && (
          <>
            <button
              onClick={() => setViewMode("list")}
              className="border border-primary/50 rounded-sm px-2 py-1 flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <MovementForm onSuccess={handleCreateSuccess} />
          </>
        )}
      </main>
    </div>
  );
}
