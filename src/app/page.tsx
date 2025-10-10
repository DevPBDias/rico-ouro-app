"use client";

import Image from "next/image";
import OpeningImg from "@/assets/images/Opening.png";
import OpeningMotion from "@/components/motions/OpeningMotion";
import { useEffect } from "react";

export default function OpeningPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/home";
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative top-0 left-0 h-dvh w-full overflow-hidden">
      <OpeningMotion />
      <Image
        src={OpeningImg}
        alt="Cow App Logo"
        fill
        className="object-cover"
        priority
      />
    </main>
  );
}
