import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import campaignLinks from "@/constants/campaignLinks";

const ReportPage = () => {
  return (
    <main>
      <Header title="Rebanhos e Fazendas" />
      <RedirectButtons data={campaignLinks} />
    </main>
  );
};

export default ReportPage;
