"use client";

import Header from "@/components/layout/Header";
import { CommercialDashboard } from "@/components/features/commercial/commercial";

export default function ComercialPage() {
  return (
    <main className="min-h-screen bg-background pb-10">
      <Header title="Gestão Comercial" />

      <div className="p-4">
        <CommercialDashboard />
      </div>
    </main>
  );
}
