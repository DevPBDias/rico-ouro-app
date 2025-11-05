import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import importLinks from "@/constants/ImportLinks";

const ImportDataPage = () => {
  return (
    <main>
      <Header title="Importar dados" />
      <RedirectButtons
        data={importLinks}
        className="grid-cols-2"
        btnHeight="py-8"
      />
    </main>
  );
};

export default ImportDataPage;
