"use client";
import Header from "@/components/layout/Header";
import SearchCsvFile from "@/components/search/SearchCsvFile";
import { limparTodosDados } from "@/utils/helpersDB";
import React from "react";

const ImportCsvFilesPage = () => {
  return (
    <main>
      <Header title="Importar planilhas" />
      <SearchCsvFile />
      <button
        onClick={() => {
          limparTodosDados();
        }}
        className="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        Limpar todos os dados
      </button>
    </main>
  );
};

export default ImportCsvFilesPage;
