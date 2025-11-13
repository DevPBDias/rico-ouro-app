import { Links } from "@/types";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
}

const HomeButtons = ({ data }: RedirectButtonsProps) => {
  return (
    <section className="rounded-xl absolute bottom-0 left-0 z-20 grid-cols-2 gap-4 pb-24 w-full bg-transparent px-8 grid">
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="bg-white text-[#1162AE] w-full px-6 rounded-xl h-22 flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2"
        >
          {link.icon && <link.icon className="w-5 h-5" />}
          <p className="font-medium w-full text-center text-xs uppercase px-2">
            {link.name}
          </p>
        </Link>
      ))}
    </section>
  );
};

export default HomeButtons;
