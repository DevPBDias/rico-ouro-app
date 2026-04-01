"use client";

import Header from "@/components/layout/Header";
import { BulkReproductionPanel } from "@/components/features/reproduction/BulkReproductionPanel";

export default function ReproducaoLotePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-20">
      <Header title="Reprodução em lote" />

        <BulkReproductionPanel />
    </div>
  );
}
