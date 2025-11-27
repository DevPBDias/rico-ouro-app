"use client";

import React from "react";
import { RxDBProvider } from "./RxDBProvider";
import { ReplicationProvider } from "./ReplicationProvider";

/**
 * LocalFirstProvider - Combina RxDB e Replication em um único provider
 * Use este provider no root layout para habilitar toda a funcionalidade local-first
 */
export function LocalFirstProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RxDBProvider>
      <ReplicationProvider>{children}</ReplicationProvider>
    </RxDBProvider>
  );
}
