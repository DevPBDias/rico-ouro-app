"use client";

import Image from "next/image";
import HomeButtons from "@/components/buttons/HomeButtons";
import { homeLinks } from "@/constants/HomeLinks";
import homePage from "@/assets/images/home-page.png";
import { motion } from "framer-motion";

const HomePage = () => {
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
  );
};

export default HomePage;
