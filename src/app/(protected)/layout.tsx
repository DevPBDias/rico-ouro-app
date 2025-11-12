"use client";

import ProtectedClient from "@/components/auth/WrapperAuth";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProtectedClient>{children}</ProtectedClient>
    </>
  );
}
