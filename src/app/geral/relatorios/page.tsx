"use client";

export const dynamic = "force-dynamic";

import RedirectButtons from "@/components/buttons/RedirectButtons";
import Header from "@/components/layout/Header";
import exportLinks from "@/constants/exportLinks";

const ReportPage = () => {
  return (
    <main>
      <Header title="Relatórios" />
      <RedirectButtons data={exportLinks} />
    </main>
  );
};

export default ReportPage;
