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
import cowModel from "@/assets/images/cow_model.png";

const HomePage = () => {
  return (
    <ProtectedClient>
      <motion.main
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative flex h-dvh w-full flex-col items-center justify-between overflow-y-auto pb-8 pt-6"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={cowModel}
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-[#1162AE]/80"></div>
        </div>

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
        <div className="relative z-20 flex w-full flex-1 flex-col gap-6 pt-6">
          <StatsFooter />
          <HomeButtons data={homeLinks} />
        </div>

        {/* Footer Partners */}
        <div className="relative z-10 mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Image
              src={abczLogo}
              alt="ABCZ"
              width={24}
              height={24}
              className="object-contain"
            />
            <div className="h-8 w-[1px] bg-slate-400"></div>
            <Image
              src={pmgzLogo}
              alt="PMGZ"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-[10px] font-medium text-white">
            Parceiros Estratégicos
          </span>
        </div>
      </motion.main>
    </ProtectedClient>
  );
};

export default HomePage;
