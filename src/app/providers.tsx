"use client";

import { RxDBProvider } from "@/providers/RxDBProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <RxDBProvider>{children}</RxDBProvider>;
}
