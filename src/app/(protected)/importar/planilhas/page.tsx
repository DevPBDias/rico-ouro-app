"use client";
import Header from "@/components/layout/Header";
import SearchCsvFile from "@/components/search/SearchCsvFile";

const ImportCsvFilesPage = () => {
  return (
    <main>
      <Header title="Importar planilhas" />
      <SearchCsvFile />
    </main>
  );
};

export default ImportCsvFilesPage;
