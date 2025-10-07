import Header from "@/components/layout/Header";
import SearchCsvFile from "@/components/search/SearchCsvFile";
import React from "react";

const ImportCsvFilesPage = () => {
  return (
    <main>
      <Header title="Importar planilhas" />
      <SearchCsvFile />
    </main>
  );
};

export default ImportCsvFilesPage;
