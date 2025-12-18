"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import openingImg from "@/assets/images/opening-page.png";
import { useRouter } from "next/navigation";

export default function OpeningPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const minWait = 3000;
    const startTime = Date.now();

    const checkAndRedirect = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minWait - elapsed);

      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          router.push("/login");
        }, 800);
      }, remaining);
    };

    if (imageLoaded) {
      checkAndRedirect();
    } else {
      const fallbackTimer = setTimeout(() => {
        checkAndRedirect();
      }, minWait);

      return () => clearTimeout(fallbackTimer);
    }
  }, [isMounted, imageLoaded, router]);

  if (!isMounted) {
    return (
      <main className="relative top-0 left-0 h-dvh w-full overflow-hidden bg-[#1162ae]" />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.main
          key="opening"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative top-0 left-0 h-dvh w-full overflow-hidden bg-[#1162ae]"
        >
          <Image
            src={openingImg}
            alt="INDI Ouro"
            fill
            className="w-full h-full object-cover"
            priority
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.warn("[Splash] Image failed to load, proceeding anyway");
              setImageLoaded(true);
            }}
          />
        </motion.main>
      )}
    </AnimatePresence>
  );
}

