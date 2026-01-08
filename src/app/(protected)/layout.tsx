"use client";

import ProtectedClient from "@/components/auth/WrapperAuth";
import { ReportsProvider } from "@/context/ReportsContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedClient>
      <ReportsProvider>{children}</ReportsProvider>
    </ProtectedClient>
  );
}
