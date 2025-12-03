"use client";

import Image from "next/image";
import HomeButtons from "@/components/buttons/HomeButtons";
import { homeLinks } from "@/constants/HomeLinks";
import { motion } from "framer-motion";
import ProtectedClient from "@/components/auth/WrapperAuth";
import { StatsFooter } from "@/components/home/StatsFooter";
import logoIndiouro from "@/assets/icons/logo_home.png";
import abczLogo from "@/assets/icons/ABCZ.png";
import pmgzLogo from "@/assets/icons/PMGZ.png";

const HomePage = () => {
  return (
    <ProtectedClient>
      <motion.main
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative flex h-dvh w-full bg-[#1162AE]/90 flex-col items-center justify-between overflow-hidden pb-8 pt-4"
      >
        {/* Header */}
        <div className="relative z-20 flex w-full flex-col items-center justify-center px-6">
          <Image
            src={logoIndiouro}
            alt="Nelore INDI Ouro"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative z-20 flex w-full flex-1 flex-col gap-6 pt-4">
          <StatsFooter />
          <HomeButtons data={homeLinks} />
        </div>

        {/* Footer Partners */}
        <div className="relative z-10 mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Image
              src={abczLogo}
              alt="ABCZ"
              width={28}
              height={28}
              className="object-contain"
            />
            <div className="h-8 w-[1px] bg-slate-400"></div>
            <Image
              src={pmgzLogo}
              alt="PMGZ"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
        </div>
      </motion.main>
    </ProtectedClient>
  );
};

export default HomePage;
