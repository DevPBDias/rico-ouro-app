import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import globalDataLinks from "@/constants/globalDataLinks";

const ReportPage = () => {
  return (
    <main>
      <Header title="Dados gerais" />
      <RedirectButtons data={globalDataLinks} />
    </main>
  );
};

export default ReportPage;
