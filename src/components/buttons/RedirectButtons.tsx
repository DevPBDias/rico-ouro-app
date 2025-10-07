import { Links } from "@/types";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
  className?: string;
}

const RedirectButtons = ({ data, className }: RedirectButtonsProps) => {
  return (
    <section
      className={`rounded-3xl z-10 ${className} w-full bg-white px-6 py-16 grid grid-cols-2 gap-6`}
    >
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="bg-[#1162AE] text-white w-full h-32 px-2 rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 "
        >
          {link.icon && <link.icon />}
          <p className="font-medium w-full text-center text-lg ">{link.name}</p>
        </Link>
      ))}
    </section>
  );
};

export default RedirectButtons;
