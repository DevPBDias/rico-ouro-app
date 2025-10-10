"use client";

import logoIndi from "@/assets/icons/Logo Jacir.png";
import { motion } from "framer-motion";
import Image from "next/image";

const OpeningMotion = () => {
  const pictureAnimation = {
    hidden: {
      opacity: 0,
      y: "100vh",
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 3,
        ease: [0.42, 0, 0.58, 1],
      },
    },
  };

  return (
    <motion.picture
      className="absolute flex flex-col z-10 gap-4 items-center top-6 left-0 w-full justify-between px-6"
      // @ts-ignore
      variants={pictureAnimation}
      initial="hidden"
      animate="visible"
    >
      <Image src={logoIndi} alt="Icone do aplicativo" width={48} height={52} />
      <h1 className="text-[#FFCB04] font-bold text-3xl text-center">
        Nelore <br /> INDI Ouro
      </h1>
    </motion.picture>
  );
};

export default OpeningMotion;
