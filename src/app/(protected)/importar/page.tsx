import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import importLinks from "@/constants/ImportLinks";

const ImportDataPage = () => {
  return (
    <main>
      <Header title="Importar dados" />
      <RedirectButtons data={importLinks} />
    </main>
  );
};

export default ImportDataPage;
