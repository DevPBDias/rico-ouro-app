"use client";
import Image from "next/image";
import OpeningImg from "@/assets/images/Opening.png";
import logoIndi from "@/assets/icons/Logo Jacir.png";
import logoABCZ from "@/assets/icons/ABCZ.png";
import logoPMGZ from "@/assets/icons/PMGZ.png";
import Link from "next/link";

export default function OpeningPage() {
  return (
    <main className="relative top-0 left-0 h-dvh w-full overflow-hidden">
      <picture className="absolute flex flex-row z-10 items-center top-6 left-0 w-full justify-between px-6">
        <Image
          src={logoPMGZ}
          alt="Icone do aplicativo"
          width={56}
          height={60}
          priority
        />
        <Image
          src={logoIndi}
          alt="Icone do aplicativo"
          width={56}
          height={60}
          priority
        />
        <Image
          src={logoABCZ}
          alt="Icone do aplicativo"
          width={56}
          height={60}
          priority
        />
      </picture>
      <Image
        src={OpeningImg}
        alt="Cow App Logo"
        fill
        className="object-cover"
        priority
      />

      <Link
        href="/home"
        className="bg-[#FFCB04] text-black absolute m-auto left-0 right-0 bottom-40 w-40 h-12 rounded-full flex justify-center items-center font-medium text-lg uppercase shadow-lg"
      >
        Entrar
      </Link>
    </main>
  );
}
