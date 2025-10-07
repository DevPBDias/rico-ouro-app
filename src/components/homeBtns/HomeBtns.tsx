import { homeLinks } from "@/constants/HomeLinks";
import Link from "next/link";

const HomeBtns = () => {
  return (
    <section className="absolute bottom-0 left-0 rounded-3xl z-10 h-2/3 w-full bg-white px-6 py-16 grid grid-cols-2 gap-6">
      {homeLinks.map((link) => (
        <Link
          href={link.href}
          className="bg-[#1162AE] text-white w-full h-32 rounded-lg flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          {link.icon && <link.icon />}
          <p className="font-medium w-full text-center text-lg ">{link.name}</p>
        </Link>
      ))}
    </section>
  );
};

export default HomeBtns;
