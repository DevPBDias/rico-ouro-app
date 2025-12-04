"use client";

import React from "react";
import { RxDBProvider } from "./RxDBProvider";
import { ReplicationProvider } from "./ReplicationProvider";

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
