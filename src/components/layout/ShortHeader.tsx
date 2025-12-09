"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/icons/logo-hor-indiouro.png";

const ShortHeader = () => {
  const router = useRouter();
  return (
    <div className="bg-primary text-primary-foreground px-4 py-3.5 shadow-lg sticky top-0 z-20">
      <div className="flex items-center justify-start gap-20">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 flex-shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center">
          <Image src={logo} alt="Logo" width={113} height={36} />
        </div>
      </div>
    </div>
  );
};

export default ShortHeader;
