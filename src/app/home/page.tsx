"use client";

import Image from "next/image";
import HomeButtons from "@/components/buttons/HomeButtons";
import { homeLinks } from "@/constants/HomeLinks";
import homePage from "@/assets/images/home-page.png";
import { motion } from "framer-motion";
import LogoutButton from "@/components/auth/LogoutBtn";
import ProtectedClient from "@/components/auth/WrapperAuth";

const HomePage = () => {
  return (
    <ProtectedClient>
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
        <LogoutButton />
        <Image
          src={homePage}
          alt="Cow App Logo"
          className="h-full w-full"
          priority
          fill
        />
        <HomeButtons data={homeLinks} />
      </motion.main>
    </ProtectedClient>
  );
};

export default HomePage;
