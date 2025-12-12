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

  return (
    <>
      {/* Offline auth indicator */}
      {isOfflineAuth && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center text-xs py-1 z-[100]">
          📴 Modo offline — dados salvos localmente serão sincronizados quando
          voltar online
        </div>
      )}
      {/* Add top padding when offline banner is visible */}
      <div className={isOfflineAuth ? "pt-6" : ""}>{children}</div>
    </>
  );
}
