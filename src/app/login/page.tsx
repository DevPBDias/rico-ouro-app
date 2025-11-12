"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { motion } from "framer-motion";
import loginImg from "@/assets/images/login-page.png";
import logoImg from "@/assets/icons/logo-hor-indiouro.png";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLocal(true);
    setErr(null);
    try {
      await signIn(email, password);
    } catch (error: unknown) {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Erro ao autenticar";
      setErr(message);
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <motion.main
      key="home"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
      }}
      className="relative p-6 flex flex-col gap-6 items-center
      justify-center w-full min-h-dvh"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={logoImg}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 w-52 h-40 object-contain z-10"
          alt="cow login page"
          priority
        />
        <Image
          src={loginImg}
          className="w-full h-full object-cover"
          alt="cow login page"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>
      <form
        onSubmit={handleSubmit}
        className="absolute w-full max-w-sm flex flex-col gap-4 bg-muted-white/50 p-6 rounded-lg shadow-md"
      >
        <div className="mt-1 flex flex-col gap-1">
          <label htmlFor="email" className="text-lg font-bold text-white">
            E-mail:
          </label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            id="email"
            className="pl-2 h-10 bg-white border border-gray-200 rounded-lg text-base"
            type="email"
          />
        </div>
        <div className="mt-1 flex flex-col gap-1">
          <label htmlFor="password" className="text-lg font-bold text-white">
            Senha:
          </label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            id="password"
            type="password"
            className="pl-2 h-10 bg-white border border-gray-200 rounded-lg text-base"
            required
          />
        </div>

        {err && <div className="text-red-600">{err}</div>}
        <Button
          disabled={loadingLocal}
          type="submit"
          className="uppercase text-sm font-bold mt-6"
        >
          {loadingLocal ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </motion.main>
  );
}
