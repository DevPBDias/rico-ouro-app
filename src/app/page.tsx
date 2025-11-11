"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import HomeButtons from "@/components/buttons/HomeButtons";
import { homeLinks } from "@/constants/HomeLinks";
import homePage from "@/assets/images/home-page.png";
import openingImg from "@/assets/images/opening-page.png";
import { motion, AnimatePresence } from "framer-motion";
const HomePage = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mostra a imagem de splash por 2 segundos, depois mostra a home
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.main
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative h-dvh w-full overflow-hidden"
          style={{ backgroundColor: "#1162ae" }}
        >
          <Image
            src={openingImg}
            alt="INDI Ouro"
            fill
            className="w-full h-full object-cover"
            priority
            unoptimized
          />
        </motion.main>
      ) : (
        <motion.main
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-dvh w-full overflow-hidden"
        >
          <Image
            src={homePage}
            alt="Cow App Logo"
            className="h-full w-full"
            priority
            fill
          />

          <HomeButtons
            data={homeLinks}
            className="absolute bottom-0 left-0 z-20 grid-cols-2 gap-4 h-[70dvh] py-40"
            colorBg="white"
            textColor="text-[#1162AE]"
          />
        </motion.main>
      )}
    </AnimatePresence>
  );
};

export default HomePage;
