import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isOfflineAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <LoadingScreen />;

  if (!user) return null;

  return <div>{children}</div>;
}
