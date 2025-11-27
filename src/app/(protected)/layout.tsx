"use client";

import ProtectedClient from "@/components/auth/WrapperAuth";
import { RxDBProvider } from "@/providers/RxDBProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RxDBProvider>
      <ProtectedClient>{children}</ProtectedClient>
    </RxDBProvider>
  );
}
