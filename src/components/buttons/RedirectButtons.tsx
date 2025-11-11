"use client";

import { Links } from "@/types";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
  className?: string;
}

const RedirectButtons = ({ data, className }: RedirectButtonsProps) => {
  return (
    <section
      className={`rounded-3xl z-10 ${className} w-full bg-transparent px-4 py-10 grid grid-cols-1 gap-2`}
    >
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className="bg-[#1162AE] text-white w-full pl-4 py-3 rounded-md flex flex-row justify-start items-center font-medium text-sm uppercase shadow-lg gap-2 text-left "
        >
          {link.name}
        </Link>
      ))}
    </section>
  );
};

export default RedirectButtons;
