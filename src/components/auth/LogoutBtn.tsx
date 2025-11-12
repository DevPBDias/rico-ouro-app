"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LucideArrowLeftFromLine, LucideClockFading } from "lucide-react";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/login");
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center absolute top-4 left-4 z-99"
    >
      {loading ? (
        <LucideClockFading size={18} color="blue" />
      ) : (
        <LucideArrowLeftFromLine size={18} color="blue" />
      )}
    </Button>
  );
}
