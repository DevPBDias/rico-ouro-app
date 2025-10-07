import HomeCow from "@/assets/images/HomeCow.png";
import logoIndi from "@/assets/icons/Logo Jacir.png";
import Image from "next/image";
import HomeBtns from "@/components/homeBtns/HomeBtns";

const HomePage = () => {
  return (
    <main className="relative top-0 left-0 h-dvh w-full overflow-hidden">
      <Image
        src={logoIndi}
        alt="Icone do aplicativo"
        width={44}
        height={48}
        className="absolute top-6 left-6"
        priority
      />
      <picture className="w-full bg-red-500">
        <Image
          src={HomeCow}
          alt="Cow App Logo"
          width={425}
          height={380}
          priority
        />
      </picture>
      <HomeBtns />
    </main>
  );
};

export default HomePage;
