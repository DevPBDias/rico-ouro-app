"use client";

import { BirthForm } from "@/components/movements/BirthForm";
import Header from "@/components/layout/Header";

export default function NascimentosPage() {
  return (
    <main className="min-h-screen bg-background pb-10">
      <Header title="Nascimento" />
      <div className="p-6 max-w-2xl mx-auto w-full">
        <BirthForm />
      </div>
    </main>
  );
}
