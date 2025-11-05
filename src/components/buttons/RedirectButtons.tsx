import { Links } from "@/types";
import Link from "next/link";

interface RedirectButtonsProps {
  data: Links[];
  className?: string;
  btnHeight?: string;
}

const RedirectButtons = ({
  data,
  className,
  btnHeight,
}: RedirectButtonsProps) => {
  return (
    <section
      className={`rounded-3xl z-10 ${className} w-full bg-transparent px-4 py-10 grid gap-2`}
    >
      {data.map((link: Links) => (
        <Link
          key={link.id}
          href={link.href}
          className={`bg-[#1162AE] text-white w-full px-2 ${btnHeight} rounded-xl flex flex-col justify-center items-center font-medium text-lg shadow-lg gap-2 `}
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

export default RedirectButtons;
