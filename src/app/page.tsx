"use client";

import Image from "next/image";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import openingImg from "@/assets/images/opening-page.png";
import { useRouter } from "next/navigation";

export default function OpeningPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeout(() => router.push("/login"), 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AnimatePresence>
      <motion.main
        key="opening"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="relative top-0 left-0 h-dvh w-full overflow-hidden"
      >
        <Image
          src={openingImg}
          alt="Cow App Logo"
          fill
          className="w-full h-full"
          priority
        />
      </motion.main>
    </AnimatePresence>
  );
}
