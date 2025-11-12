import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Entrando...</div>;
  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }
  return <>{children}</>;
}