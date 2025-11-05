"use client";

import Image from "next/image";
import RedirectButtons from "@/components/buttons/RedirectButtons";
import { homeLinks } from "@/constants/HomeLinks";
import logoIndi from "@/assets/icons/Logo Jacir.png";
import logoABCZ from "@/assets/icons/ABCZ.png";
import logoPMGZ from "@/assets/icons/PMGZ.png";
import HomeCow from "@/assets/images/Opening.png";

const HomePage = () => {
  return (
    <main className="relative h-dvh w-full overflow-hidde bg-blue-500">
      <div className="absolute z-10 flex flex-row items-center top-6 left-0 w-full justify-between px-6">
        <Image src={logoPMGZ} alt="Logo PMGZ" width={40} height={44} priority />
        <Image
          src={logoIndi}
          alt="Logo Jacir"
          width={40}
          height={44}
          priority
        />
        <Image src={logoABCZ} alt="Logo ABCZ" width={40} height={44} priority />
      </div>

      <picture className="w-full h-dvh">
        <Image
          src={HomeCow}
          alt="Cow App Logo"
          className="h-full w-full object-cover"
          priority
        />
      </picture>

      <RedirectButtons
        data={homeLinks}
        className="absolute bottom-0 left-0 z-20 grid-cols-3 h-[35dvh]"
      />
    </main>
  );
};

export default HomePage;
