"use client";
import { ArrowLeftCircleIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/icons/logo-hor-indiouro.png";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="w-full p-4 bg-[#1162AE] text-white flex flex-col items-center gap-5">
      <div className="flex items-center justify-center">
        <Image src={logo} alt="Logo" width={113} height={36} />
      </div>
      <nav className="flex items-center justify-between w-full py-2">
        <ArrowLeftCircleIcon
          size={30}
          className="cursor-pointer"
          onClick={() => router.back()}
        />
        <h1 className="text-xl font-medium uppercase">{title}</h1>
        <HomeIcon
          onClick={() => router.push("/home")}
          size={30}
          color="white"
        />
      </nav>
    </header>
  );
}

export default Header;
