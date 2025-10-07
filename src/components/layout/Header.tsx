"use client";
import { ArrowLeftCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import logoIndi from "@/assets/icons/Logo Jacir.png";
import Image from "next/image";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full h-18 px-6 py-4 bg-[#1162AE] text-white flex items-center justify-between">
      <ArrowLeftCircleIcon
        size={30}
        className="cursor-pointer"
        onClick={() => router.back()}
      />
      <h1 className="text-xl font-medium uppercase">{title}</h1>
      <Image
        src={logoIndi}
        alt="Icone do aplicativo"
        width={30}
        height={34}
        priority
      />
    </header>
  );
}

export default Header;
