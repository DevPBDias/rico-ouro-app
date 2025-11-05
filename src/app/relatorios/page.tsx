import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import exportLinks from "@/constants/exportLinks";

const ReportPage = () => {
  return (
    <main>
      <Header title="Relatórios" />
      <RedirectButtons
        data={exportLinks}
        className="grid-cols-2"
        btnHeight="py-8"
      />
    </main>
  );
};

export default ReportPage;
